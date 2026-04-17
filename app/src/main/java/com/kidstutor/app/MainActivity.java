package com.kidstutor.app;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ComponentName;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.widget.Toast;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;

public class MainActivity extends Activity {

    private WebView webView;
    private TextToSpeech tts;
    private SpeechRecognizer speechRecognizer;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    private boolean ttsReady = false;
    private String currentLang = "zh-CN";

    private static final int PERMISSION_REQUEST_CODE = 100;
    private String pendingAction = null;
    private String pendingLang = "zh-CN";

    // Track permission grant state to avoid stale closure captures
    private boolean permissionGranted = false;

    // ── JavaScript Bridge ────────────────────────────────────────────────────
    private class AndroidBridge {

        /** Called by JS to speak text via native TTS */
        @JavascriptInterface
        public void speak(String text, String lang) {
            if (!ttsReady) {
                notifyJS("onTtsError", "TTS未就绪");
                return;
            }
            currentLang = lang;
            mainHandler.post(() -> {
                Locale locale = langToLocale(lang);
                int result = tts.setLanguage(locale);
                if (result == TextToSpeech.LANG_MISSING_DATA || result == TextToSpeech.LANG_NOT_SUPPORTED) {
                    tts.setLanguage(Locale.CHINESE);
                }
                tts.setSpeechRate(0.9f);
                tts.setPitch(1.0f);

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "TTS_" + System.currentTimeMillis());
                } else {
                    HashMap<String, String> params = new HashMap<>();
                    params.put(TextToSpeech.Engine.KEY_PARAM_UTTERANCE_ID, "TTS_ID");
                    tts.speak(text, TextToSpeech.QUEUE_FLUSH, params);
                }
            });
        }

        /** Called by JS to stop TTS */
        @JavascriptInterface
        public void stopSpeak() {
            mainHandler.post(() -> {
                if (tts != null) tts.stop();
                notifyJS("onTtsStopped", "");
            });
        }

        /** Called by JS to start voice recognition */
        @JavascriptInterface
        public void startListening(String lang) {
            currentLang = lang;
            mainHandler.post(() -> {
                // Always re-check permission at moment of execution
                if (!hasAudioPermission()) {
                    pendingAction = "startListening";
                    pendingLang = lang;
                    permissionGranted = false;
                    requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, PERMISSION_REQUEST_CODE);
                    return;
                }
                // Permission confirmed granted — proceed
                pendingAction = null;
                permissionGranted = true;
                startSpeechRecognition(lang);
            });
        }

        /** Called by JS to stop recognition */
        @JavascriptInterface
        public void stopListening() {
            mainHandler.post(() -> {
                if (speechRecognizer != null) {
                    speechRecognizer.stopListening();
                }
            });
        }

        /** Called by JS to check capabilities */
        @JavascriptInterface
        public boolean isTtsSupported() { return ttsReady; }

        @JavascriptInterface
        public boolean isSttSupported() {
            return SpeechRecognizer.isRecognitionAvailable(MainActivity.this);
        }
    }

    // ── Lifecycle ────────────────────────────────────────────────────────────
    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // Status bar color
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            Window window = getWindow();
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.parseColor("#0f0d0a"));
        }

        // Request mic permission early
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
                requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, PERMISSION_REQUEST_CODE);
            } else {
                permissionGranted = true;
            }
        } else {
            permissionGranted = true;
        }

        // Init TTS
        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) {
                ttsReady = true;
                tts.setLanguage(Locale.CHINESE);
                // Set utterance listener
                tts.setOnUtteranceProgressListener(new UtteranceProgressListener() {
                    @Override public void onStart(String id) { notifyJS("onTtsStarted", ""); }
                    @Override public void onDone(String id) { notifyJS("onTtsStopped", ""); }
                    @Override public void onError(String id) { notifyJS("onTtsStopped", ""); }
                });
                notifyJS("onTtsReady", "true");
            }
        });

        // Init WebView
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
        }

        // Add JS bridge
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidTutor");

        webView.setWebViewClient(new WebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onPermissionRequest(final PermissionRequest request) {
                request.grant(request.getResources());
            }
        });

        webView.loadUrl("file:///android_asset/index.html");
    }

    // ── Speech Recognition ───────────────────────────────────────────────────
    private boolean hasAudioPermission() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.M) {
            return true;
        }
        return checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED;
    }

    private void startSpeechRecognition(String lang) {
        if (speechRecognizer != null) {
            speechRecognizer.destroy();
            speechRecognizer = null;
        }

        // Re-check permission at moment of execution
        if (!hasAudioPermission()) {
            pendingAction = "startListening";
            pendingLang = lang;
            permissionGranted = false;
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, PERMISSION_REQUEST_CODE);
            return;
        }

        // Check if any speech recognition service is available
        if (!SpeechRecognizer.isRecognitionAvailable(this)) {
            notifyJS("onSpeechError", "当前设备不支持语音识别");
            return;
        }

        // Find the best available recognition service
        ComponentName bestService = findBestRecognitionService();
        if (bestService == null) {
            notifyJS("onSpeechError", "未找到语音识别服务，请在系统设置中启用");
            return;
        }

        try {
            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this, bestService);
            if (speechRecognizer == null) {
                notifyJS("onSpeechError", "语音识别创建失败，请重启应用");
                return;
            }
        } catch (Exception e) {
            notifyJS("onSpeechError", "语音识别初始化失败: " + e.getMessage());
            return;
        }

        speechRecognizer.setRecognitionListener(new RecognitionListener() {
            @Override
            public void onReadyForSpeech(Bundle params) {
                notifyJS("onSpeechReady", "");
            }
            @Override
            public void onBeginningOfSpeech() {
                notifyJS("onSpeechStart", "");
            }
            @Override
            public void onRmsChanged(float rmsdB) {
                notifyJS("onSpeechVolume", String.valueOf((int)Math.max(0, Math.min(100, (rmsdB + 2) * 8))));
            }
            @Override
            public void onEndOfSpeech() {
                notifyJS("onSpeechEnd", "");
            }
            @Override
            public void onError(int error) {
                String msg;
                switch (error) {
                    case SpeechRecognizer.ERROR_NO_MATCH:
                        msg = "没有识别到语音";
                        break;
                    case SpeechRecognizer.ERROR_SPEECH_TIMEOUT:
                        msg = "语音超时，请重试";
                        break;
                    case SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS:
                        // 即使checkSelfPermission通过，实际服务仍可能无权限，重试一次
                        msg = "麦克风权限不足，正在重试...";
                        notifyJS("onSpeechError", msg);
                        // 重试前先等permissionGrantResult传播
                        mainHandler.postDelayed(() -> {
                            if (speechRecognizer != null) {
                                speechRecognizer.destroy();
                                speechRecognizer = null;
                            }
                            if (hasAudioPermission()) {
                                startSpeechRecognition(lang);
                            } else {
                                notifyJS("onSpeechError", "麦克风权限被拒绝，请在系统设置中开启");
                            }
                        }, 500);
                        return;
                    case SpeechRecognizer.ERROR_NETWORK:
                        msg = "网络错误，请检查网络";
                        break;
                    case SpeechRecognizer.ERROR_AUDIO:
                        msg = "音频错误，请重启应用";
                        break;
                    case SpeechRecognizer.ERROR_CLIENT:
                        msg = "客户端错误，请重启应用";
                        break;
                    case SpeechRecognizer.ERROR_RECOGNIZER_BUSY:
                        msg = "语音服务忙碌，请稍后重试";
                        break;
                    case SpeechRecognizer.ERROR_SERVER:
                        msg = "服务器错误，请检查网络";
                        break;
                    default:
                        msg = "识别错误(" + error + ")，请重试";
                }
                notifyJS("onSpeechError", msg);
            }
            @Override
            public void onResults(Bundle results) {
                ArrayList<String> matches = results.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (matches != null && !matches.isEmpty()) {
                    notifyJS("onSpeechResult", matches.get(0));
                } else {
                    notifyJS("onSpeechError", "未识别到内容");
                }
            }
            @Override
            public void onPartialResults(Bundle partialResults) {
                ArrayList<String> partial = partialResults.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                if (partial != null && !partial.isEmpty()) {
                    notifyJS("onSpeechPartial", partial.get(0));
                }
            }
            @Override public void onBufferReceived(byte[] buffer) {}
            @Override public void onEvent(int eventType, Bundle params) {}
        });

        Intent recognizerIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE, langToLocale(lang).toString());
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_PREFERENCE, langToLocale(lang).toString());
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_ONLY_RETURN_LANGUAGE_PREFERENCE, true);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS, 500L);
        recognizerIntent.putExtra(RecognizerIntent.EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS, 1500L);

        speechRecognizer.startListening(recognizerIntent);
    }

    /**
     * Find the best available speech recognition service.
     * Prefer device-specific services over Google's.
     */
    private ComponentName findBestRecognitionService() {
        Intent serviceIntent = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
        List<ResolveInfo> services = getPackageManager().queryIntentServices(serviceIntent, PackageManager.MATCH_ALL);

        if (services == null || services.isEmpty()) {
            return null;
        }

        // Find the first available service
        for (ResolveInfo info : services) {
            if (info.serviceInfo != null && info.serviceInfo.packageName != null) {
                return new ComponentName(info.serviceInfo.packageName, info.serviceInfo.name);
            }
        }
        return null;
    }

    // ── Helpers ─────────────────────────────────────────────────────────────
    private Locale langToLocale(String lang) {
        if (lang == null) return Locale.CHINESE;
        switch (lang) {
            case "en-US": return Locale.US;
            case "en-GB": return Locale.UK;
            case "ja-JP": return Locale.JAPAN;
            case "ko-KR": return Locale.KOREA;
            case "fr-FR": return Locale.FRENCH;
            case "de-DE": return Locale.GERMAN;
            default:      return Locale.CHINESE;
        }
    }

    /** Run JS callback on main thread */
    private void notifyJS(final String callback, final String data) {
        mainHandler.post(() -> {
            if (webView != null) {
                String escaped = data.replace("\\", "\\\\").replace("'", "\\'");
                webView.evaluateJavascript("if(window." + callback + ")window." + callback + "('" + escaped + "');", null);
            }
        });
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == PERMISSION_REQUEST_CODE) {
            if (grantResults.length > 0 && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                permissionGranted = true;
                notifyJS("onPermissionGranted", "audio");
                // Execute pending action with a small delay to let permission state propagate
                String action = pendingAction;
                String lang = pendingLang;
                pendingAction = null; // Clear BEFORE executing
                if ("startListening".equals(action)) {
                    mainHandler.postDelayed(() -> startSpeechRecognition(lang), 200);
                }
            } else {
                permissionGranted = false;
                pendingAction = null;
                Toast.makeText(this, "麦克风权限被拒绝，请在系统设置中开启", Toast.LENGTH_LONG).show();
                notifyJS("onPermissionDenied", "audio");
            }
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
        // Check if permission was granted while app was in background
        if (webView != null && hasAudioPermission() && !permissionGranted) {
            permissionGranted = true;
            webView.post(() -> {
                if (webView != null) {
                    webView.evaluateJavascript("if(window.onPermissionGranted)window.onPermissionGranted('audio');", null);
                }
            });
        }
    }

    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) webView.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onPause() {
        super.onPause();
        webView.onPause();
        if (tts != null) tts.stop();
        if (speechRecognizer != null) speechRecognizer.stopListening();
    }

    @Override
    protected void onDestroy() {
        if (tts != null)        { tts.stop(); tts.shutdown(); }
        if (speechRecognizer != null) { speechRecognizer.destroy(); }
        webView.destroy();
        super.onDestroy();
    }
}
