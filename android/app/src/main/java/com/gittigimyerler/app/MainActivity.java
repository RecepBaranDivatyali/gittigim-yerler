package com.gittigimyerler.app;

import android.accounts.AccountManager;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.Dialog;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.Gravity;
import android.view.ViewGroup;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.TextView;
import com.getcapacitor.BridgeActivity;
import java.util.UUID;
import org.json.JSONObject;

public class MainActivity extends BridgeActivity {

    private static final int RC_GOOGLE_ACCOUNT_PICKER = 9001;
    private static final String GOOGLE_WEB_CLIENT_ID =
        "272484411443-ooum1jv00m9ih5do7s9htevmc0vrvn69.apps.googleusercontent.com";
    private static final String FIREBASE_REDIRECT_URI =
        "https://gezgin-app-c269d.firebaseapp.com/__/auth/handler";

    private Dialog oauthDialog;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        attachNativeAuthBridge();
    }

    @Override
    public void onStart() {
        super.onStart();
        attachNativeAuthBridge();
    }

    private void attachNativeAuthBridge() {
        try {
            if (this.bridge != null && this.bridge.getWebView() != null) {
                WebView webView = this.bridge.getWebView();
                webView.removeJavascriptInterface("NativeAuthBridge");
                webView.addJavascriptInterface(new NativeAuthBridge(), "NativeAuthBridge");
            }
        } catch (Exception ignored) {}
    }

    public class NativeAuthBridge {

        @JavascriptInterface
        public void signInWithGoogle() {
            runOnUiThread(() -> {
                try {
                    Intent intent;
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                        intent = AccountManager.newChooseAccountIntent(
                            null,
                            null,
                            new String[] { "com.google" },
                            null,
                            null,
                            null,
                            null
                        );
                    } else {
                        @SuppressWarnings("deprecation")
                        Intent legacyIntent = AccountManager.newChooseAccountIntent(
                            null,
                            null,
                            new String[] { "com.google" },
                            false,
                            null,
                            null,
                            null,
                            null
                        );
                        intent = legacyIntent;
                    }
                    startActivityForResult(intent, RC_GOOGLE_ACCOUNT_PICKER);
                } catch (Exception e) {
                    // Fallback to native OAuth WebView dialog if system AccountPicker is unavailable
                    openGoogleOAuthWebViewDialog();
                }
            });
        }

        @JavascriptInterface
        public void openGoogleOAuthModal() {
            runOnUiThread(() -> openGoogleOAuthWebViewDialog());
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == RC_GOOGLE_ACCOUNT_PICKER) {
            try {
                if (resultCode == Activity.RESULT_OK && data != null) {
                    String email = data.getStringExtra(AccountManager.KEY_ACCOUNT_NAME);
                    if (email != null && !email.trim().isEmpty()) {
                        JSONObject payload = new JSONObject();
                        payload.put("email", email.trim());
                        payload.put("provider", "google");
                        sendGoogleResultToJs(payload.toString());
                        return;
                    }
                }
                JSONObject cancelPayload = new JSONObject();
                cancelPayload.put("cancelled", true);
                sendGoogleResultToJs(cancelPayload.toString());
            } catch (Exception e) {
                sendGoogleResultToJs("{\"cancelled\":true}");
            }
            return;
        }
        super.onActivityResult(requestCode, resultCode, data);
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void openGoogleOAuthWebViewDialog() {
        try {
            if (oauthDialog != null && oauthDialog.isShowing()) {
                oauthDialog.dismiss();
            }

            oauthDialog = new Dialog(this, android.R.style.Theme_DeviceDefault_NoActionBar);
            oauthDialog.requestWindowFeature(Window.FEATURE_NO_TITLE);

            LinearLayout root = new LinearLayout(this);
            root.setOrientation(LinearLayout.VERTICAL);
            root.setBackgroundColor(Color.WHITE);
            root.setLayoutParams(
                new ViewGroup.LayoutParams(
                    ViewGroup.LayoutParams.MATCH_PARENT,
                    ViewGroup.LayoutParams.MATCH_PARENT
                )
            );

            // Top header bar with Cancel button
            LinearLayout header = new LinearLayout(this);
            header.setOrientation(LinearLayout.HORIZONTAL);
            header.setGravity(Gravity.CENTER_VERTICAL);
            header.setBackgroundColor(Color.parseColor("#F8F9FA"));
            int padH = (int) (16 * getResources().getDisplayMetrics().density);
            int padV = (int) (12 * getResources().getDisplayMetrics().density);
            header.setPadding(padH, padV, padH, padV);

            TextView titleView = new TextView(this);
            titleView.setText("Google ile Oturum Açın");
            titleView.setTextColor(Color.parseColor("#202124"));
            titleView.setTextSize(16f);
            LinearLayout.LayoutParams titleParams = new LinearLayout.LayoutParams(
                0,
                ViewGroup.LayoutParams.WRAP_CONTENT,
                1f
            );
            header.addView(titleView, titleParams);

            TextView closeBtn = new TextView(this);
            closeBtn.setText("Vazgeç");
            closeBtn.setTextColor(Color.parseColor("#1A73E8"));
            closeBtn.setTextSize(15f);
            closeBtn.setOnClickListener(v -> {
                if (oauthDialog != null && oauthDialog.isShowing()) {
                    oauthDialog.dismiss();
                }
                sendGoogleResultToJs("{\"cancelled\":true}");
            });
            header.addView(closeBtn);
            root.addView(header);

            WebView oauthWebView = new WebView(this);
            WebSettings settings = oauthWebView.getSettings();
            settings.setJavaScriptEnabled(true);
            settings.setDomStorageEnabled(true);
            // Strip "; wv" so Google OAuth allows sign-in inside the dialog WebView
            String defaultUa = settings.getUserAgentString();
            String cleanUa = defaultUa != null
                ? defaultUa.replace("; wv", "").replace("Version/4.0 ", "")
                : "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36";
            settings.setUserAgentString(cleanUa);

            oauthWebView.setWebViewClient(new WebViewClient() {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    if (request != null && request.getUrl() != null) {
                        if (handleOAuthRedirectUrl(request.getUrl().toString())) {
                            return true;
                        }
                    }
                    return false;
                }

                @SuppressWarnings("deprecation")
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, String url) {
                    if (url != null && handleOAuthRedirectUrl(url)) {
                        return true;
                    }
                    return false;
                }
            });

            FrameLayout.LayoutParams webParams = new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT
            );
            root.addView(oauthWebView, webParams);

            oauthDialog.setContentView(root);
            oauthDialog.setOnCancelListener(d -> sendGoogleResultToJs("{\"cancelled\":true}"));
            oauthDialog.show();

            String nonce = UUID.randomUUID().toString();
            String authUrl =
                "https://accounts.google.com/o/oauth2/v2/auth" +
                "?response_type=id_token" +
                "&client_id=" + Uri.encode(GOOGLE_WEB_CLIENT_ID) +
                "&redirect_uri=" + Uri.encode(FIREBASE_REDIRECT_URI) +
                "&scope=" + Uri.encode("openid email profile") +
                "&prompt=select_account" +
                "&nonce=" + Uri.encode(nonce);

            oauthWebView.loadUrl(authUrl);
        } catch (Exception e) {
            sendGoogleResultToJs("{\"cancelled\":true}");
        }
    }

    private boolean handleOAuthRedirectUrl(String url) {
        if (url != null && url.startsWith(FIREBASE_REDIRECT_URI)) {
            try {
                if (oauthDialog != null && oauthDialog.isShowing()) {
                    oauthDialog.dismiss();
                }
                int hashIdx = url.indexOf('#');
                if (hashIdx != -1) {
                    String fragment = url.substring(hashIdx + 1);
                    String[] pairs = fragment.split("&");
                    for (String pair : pairs) {
                        int eq = pair.indexOf('=');
                        if (eq > 0) {
                            String key = Uri.decode(pair.substring(0, eq));
                            String val = Uri.decode(pair.substring(eq + 1));
                            if ("id_token".equals(key) && val != null && !val.isEmpty()) {
                                JSONObject payload = new JSONObject();
                                payload.put("idToken", val);
                                payload.put("provider", "google");
                                sendGoogleResultToJs(payload.toString());
                                return true;
                            }
                        }
                    }
                }
            } catch (Exception ignored) {}
            sendGoogleResultToJs("{\"cancelled\":true}");
            return true;
        }
        return false;
    }

    private void sendGoogleResultToJs(final String jsonPayload) {
        runOnUiThread(() -> {
            try {
                if (this.bridge != null && this.bridge.getWebView() != null) {
                    String js =
                        "window.__onNativeGoogleAuthResult && window.__onNativeGoogleAuthResult(" +
                        jsonPayload +
                        ");";
                    this.bridge.getWebView().evaluateJavascript(js, null);
                }
            } catch (Exception ignored) {}
        });
    }
}
