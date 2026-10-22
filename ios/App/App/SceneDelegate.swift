import UIKit
import Capacitor
import WebKit
import AuthenticationServices

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = AuthBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}

class AuthBridgeViewController: CAPBridgeViewController, WKScriptMessageHandler, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding, WKNavigationDelegate {

    private let googleWebClientId = "272484411443-ooum1jv00m9ih5do7s9htevmc0vrvn69.apps.googleusercontent.com"
    private let firebaseRedirectUri = "https://gezgin-app-c269d.firebaseapp.com/__/auth/handler"
    private var googleModalNav: UINavigationController?

    override func capacitorDidLoad() {
        super.capacitorDidLoad()
        self.webView?.configuration.userContentController.removeScriptMessageHandler(forName: "nativeAuth")
        self.webView?.configuration.userContentController.add(self, name: "nativeAuth")
    }

    func userContentController(_ userContentController: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.name == "nativeAuth",
              let body = message.body as? [String: Any],
              let action = body["action"] as? String else { return }

        DispatchQueue.main.async {
            if action == "signInWithApple" {
                self.startAppleSignIn(nonce: body["nonce"] as? String)
            } else if action == "signInWithGoogle" {
                self.startGoogleOAuthSheet()
            }
        }
    }

    // MARK: - Native iOS Sign in with Apple (Face ID / Touch ID)
    private func startAppleSignIn(nonce: String?) {
        let provider = ASAuthorizationAppleIDProvider()
        let request = provider.createRequest()
        request.requestedScopes = [.fullName, .email]
        if let n = nonce, !n.isEmpty { request.nonce = n }

        let controller = ASAuthorizationController(authorizationRequests: [request])
        controller.delegate = self
        controller.presentationContextProvider = self
        controller.performRequests()
    }

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        return self.view.window ?? UIWindow()
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        if let credential = authorization.credential as? ASAuthorizationAppleIDCredential {
            let userId = credential.user
            let defaults = UserDefaults.standard

            var email = credential.email
            if let e = email, !e.isEmpty {
                defaults.set(e, forKey: "gv_apple_email_\(userId)")
            } else {
                email = defaults.string(forKey: "gv_apple_email_\(userId)")
            }

            var fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
                .compactMap { $0 }
                .joined(separator: " ")
                .trimmingCharacters(in: .whitespaces)
            if !fullName.isEmpty {
                defaults.set(fullName, forKey: "gv_apple_name_\(userId)")
            } else {
                fullName = defaults.string(forKey: "gv_apple_name_\(userId)") ?? ""
            }

            var idToken = ""
            if let tokenData = credential.identityToken,
               let tokenStr = String(data: tokenData, encoding: .utf8) {
                idToken = tokenStr
            }

            let payload: [String: Any] = [
                "userIdentifier": userId,
                "email": email ?? "",
                "fullName": fullName,
                "identityToken": idToken,
                "provider": "apple"
            ]
            sendJsonToJs(fnName: "__onNativeAppleAuthResult", dict: payload)
        } else {
            sendJsonToJs(fnName: "__onNativeAppleAuthResult", dict: ["cancelled": true])
        }
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        let nsErr = error as NSError
        if nsErr.code == ASAuthorizationError.canceled.rawValue {
            sendJsonToJs(fnName: "__onNativeAppleAuthResult", dict: ["cancelled": true])
        } else {
            sendJsonToJs(fnName: "__onNativeAppleAuthResult", dict: ["error": "APPLE_\(nsErr.code)"])
        }
    }

    // MARK: - Native iOS Google OAuth Sheet
    private func startGoogleOAuthSheet() {
        let vc = UIViewController()
        vc.view.backgroundColor = .systemBackground
        vc.title = "Google ile Oturum Açın"
        vc.navigationItem.rightBarButtonItem = UIBarButtonItem(
            title: "Vazgeç",
            style: .done,
            target: self,
            action: #selector(closeGoogleOAuthSheet)
        )

        let config = WKWebViewConfiguration()
        let oauthWebView = WKWebView(frame: vc.view.bounds, configuration: config)
        oauthWebView.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        oauthWebView.navigationDelegate = self
        oauthWebView.customUserAgent = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        vc.view.addSubview(oauthWebView)

        let nav = UINavigationController(rootViewController: vc)
        nav.modalPresentationStyle = .pageSheet
        self.googleModalNav = nav
        self.present(nav, animated: true)

        let nonce = UUID().uuidString
        var comps = URLComponents(string: "https://accounts.google.com/o/oauth2/v2/auth")!
        comps.queryItems = [
            URLQueryItem(name: "response_type", value: "id_token"),
            URLQueryItem(name: "client_id", value: googleWebClientId),
            URLQueryItem(name: "redirect_uri", value: firebaseRedirectUri),
            URLQueryItem(name: "scope", value: "openid email profile"),
            URLQueryItem(name: "prompt", value: "select_account"),
            URLQueryItem(name: "nonce", value: nonce)
        ]
        if let url = comps.url {
            oauthWebView.load(URLRequest(url: url))
        }
    }

    @objc private func closeGoogleOAuthSheet() {
        self.googleModalNav?.dismiss(animated: true)
        self.googleModalNav = nil
        sendJsonToJs(fnName: "__onNativeGoogleAuthResult", dict: ["cancelled": true])
    }

    func webView(_ webView: WKWebView, decidePolicyFor navigationAction: WKNavigationAction, decisionHandler: @escaping (WKNavigationPolicy) -> Void) {
        if let urlStr = navigationAction.request.url?.absoluteString,
           urlStr.hasPrefix(firebaseRedirectUri) {
            decisionHandler(.cancel)
            self.googleModalNav?.dismiss(animated: true)
            self.googleModalNav = nil

            if let hashRange = urlStr.range(of: "#") {
                let fragment = String(urlStr[hashRange.upperBound...])
                for pair in fragment.components(separatedBy: "&") {
                    let parts = pair.components(separatedBy: "=")
                    if parts.count == 2, parts[0] == "id_token" {
                        let idToken = parts[1].removingPercentEncoding ?? parts[1]
                        sendJsonToJs(fnName: "__onNativeGoogleAuthResult", dict: [
                            "idToken": idToken,
                            "provider": "google"
                        ])
                        return
                    }
                }
            }
            sendJsonToJs(fnName: "__onNativeGoogleAuthResult", dict: ["cancelled": true])
            return
        }
        decisionHandler(.allow)
    }

    private func sendJsonToJs(fnName: String, dict: [String: Any]) {
        guard let data = try? JSONSerialization.data(withJSONObject: dict, options: []),
              let jsonStr = String(data: data, encoding: .utf8) else { return }
        let js = "window.\(fnName) && window.\(fnName)(\(jsonStr));"
        DispatchQueue.main.async {
            self.webView?.evaluateJavaScript(js, completionHandler: nil)
        }
    }
}
