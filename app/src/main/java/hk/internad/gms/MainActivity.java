package hk.internad.gms;

import android.app.Activity;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.os.AsyncTask;
import android.os.Build;
import android.os.Bundle;
import android.provider.Settings;
import android.support.annotation.NonNull;
import android.util.Log;
import android.view.KeyEvent;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import static hk.internad.gms.Common.copyFilesAssets;
import static hk.internad.gms.Common.readFile;
import static hk.internad.gms.Common.unpackZip;
import static hk.internad.gms.Common.writeFile;

public class MainActivity extends Activity {
    private WebView webview;
    private static final int EXTERNAL_STORAGE_REQUEST = 1;
    private String dataPath;
    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        getWindow().setFlags(WindowManager.LayoutParams.FLAG_FULLSCREEN,
                WindowManager.LayoutParams.FLAG_FULLSCREEN);
        setRequestedOrientation (ActivityInfo.SCREEN_ORIENTATION_PORTRAIT);
        setContentView(R.layout.activity_main);
        dataPath= getFilesDir().getAbsolutePath();
        copyHtml();
        setWebView();
        writeDeviceJS();
        writeNotificationJS();
        webview.loadUrl("file:///"+ dataPath + "/wos/login.html");
    }

    private void copyHtml(){
        File file = new File(dataPath + "/wos/active.js");
        if (!file.exists()) {
            writeFile(dataPath + "/wos/active.js","var __activeInfo = { \"token\": \"\", \"expiry_date\": \"\" };");
        }

        if (getVersionCode() != getAppCode()){
            copyFilesAssets("wos", dataPath  + "/wos");
            setAppcode(getVersionCode());
        }
    }

    private void setWebView(){
        webview = (WebView) findViewById(R.id.webview);
        webview.getSettings().setDomStorageEnabled(true);
        webview.getSettings().setJavaScriptEnabled(true);
        webview.setWebChromeClient(new WebChromeClient());
        webview.getSettings().setAllowFileAccess(true);
        webview.getSettings().setAppCacheEnabled(true);
        webview.getSettings().setDatabaseEnabled(true);
        webview.getSettings().setGeolocationEnabled(true);
        webview.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
        webview.getSettings().setAllowUniversalAccessFromFileURLs(true);
        webview.getSettings().setGeolocationDatabasePath(getFilesDir().getPath());
        webview.getSettings().setMediaPlaybackRequiresUserGesture(false);
        webview.addJavascriptInterface(new JavaScriptInterface(), "android");

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        webview.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                view.loadUrl(url);
                return true;
            }
        });

    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (event.getAction() == KeyEvent.ACTION_DOWN) {
            switch (keyCode) {
                case KeyEvent.KEYCODE_BACK:
                    if (webview.canGoBack()) {
                        webview.goBack();
                    } else {
                        super.onKeyDown(keyCode,event);
                    }
                    return true;
            }
        }
        return super.onKeyDown(keyCode, event);
    }

    public class JavaScriptInterface {

        @JavascriptInterface
        public void writeJsFile(String jsString) throws IOException {
            try{
                JSONObject jsonObject = new JSONObject(jsString);
                String FileName = jsonObject.getString("FileName");
                String Content = jsonObject.getString("Content");
                writeFile(dataPath + "/wos/js/" + FileName, Content);
            }
            catch(JSONException e) {
                e.printStackTrace();
            }
        }

        @JavascriptInterface
        public void downloadZip(String zipPath) throws IOException {
            new DownloadFileFromURL(dataPath + "/wos/data/db.zip").execute(zipPath);
        }
    }

    private  void writeNotificationJS(){
        FirebaseInstanceId.getInstance().getInstanceId()
                .addOnCompleteListener(new OnCompleteListener<InstanceIdResult>() {
                    @Override
                    public void onComplete(@NonNull Task<InstanceIdResult> task) {
                        if (!task.isSuccessful()) {
                            Log.w("FirebaseInstanceId", "getInstanceId failed", task.getException());
                            return;
                        }

                        // Get new Instance ID token
                        String token = task.getResult().getToken();
                        token ="var __notificationToken = '" + token + "'";
                        writeFile(dataPath + "/wos/js/notification.js", token);
                    }
                });
    }

    private void writeDeviceJS(){
        String ANDROID_ID = Settings.System.getString(getContentResolver(), Settings.Secure.ANDROID_ID);
        String device = Build.DEVICE;
        String model = Build.MODEL;
        String deviceJson =
                "var __deviceInfo = {\n" +
                        "    \"Name\": \"" + model + "\",\n" +
                        "    \"Model\": \"" + device + "\",\n" +
                        "    \"OS\": \"android\",\n" +
                        "    \"UUID\": \"" + ANDROID_ID + "\"\n" +
                        "};";
        writeFile(dataPath + "/wos/js/device.js", deviceJson);
    }



    public long getVersionCode(){
        PackageManager packageManager=getPackageManager();
        PackageInfo packageInfo;
        long versionCode=0;
        try {
            packageInfo=packageManager.getPackageInfo(getPackageName(),0);
            versionCode=packageInfo.getLongVersionCode();
        } catch (PackageManager.NameNotFoundException e) {
            e.printStackTrace();
        }
        return versionCode;
    }

    public long getAppCode(){
        return Long.valueOf(readFile(dataPath + "/wos/appCode.txt") );
    }

    public void setAppcode(long appcode){
        writeFile(dataPath + "/wos/appCode.txt",String.valueOf(appcode));
    }

    class DownloadFileFromURL extends AsyncTask<String, String, String> {

        String fileName;
        public DownloadFileFromURL(String fileName) {
            this.fileName = fileName;
        }

        @Override
        protected void onPreExecute() {
            super.onPreExecute();

        }

        @Override
        protected String doInBackground(String... f_url) {
            String downloadUrl = f_url[0];
            try {
                URL url = new URL(downloadUrl);
                URLConnection conn = url.openConnection();
                InputStream is = conn.getInputStream();
                int contentLength = conn.getContentLength();
                Log.e("download", "contentLength = " + contentLength);

                File file1 = new File(fileName);
                if (file1.exists()) {
                    file1.delete();
                }
                byte[] bs = new byte[1024];
                int len;
                int BufferSize = 0;
                OutputStream os = new FileOutputStream(fileName);
                while ((len = is.read(bs)) != -1) {

                    os.write(bs, 0, len);
                    BufferSize += len;
                    publishProgress(String.valueOf((BufferSize * 100) / contentLength));
                }
                onProgressUpdate();
                Log.e("download", "download-finish");
                os.close();
                is.close();
                unpackZip(dataPath + "/wos/data/","db.zip");
                publishProgress("101");
            } catch (Exception e) {
                e.printStackTrace();
                return e.fillInStackTrace().toString();
            }
            return "success";
        }

        protected void onProgressUpdate(String... progress) {
            webview.evaluateJavascript("showDownloadProgress(" + progress[0] + ", 101)", null);
        }


        @Override
        protected void onPostExecute(String result) {
            webview.evaluateJavascript("javascript:doAfterDownloadZip(" + result +")", null );
        }

    }


}
