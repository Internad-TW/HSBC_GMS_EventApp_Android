package hk.internad.gms;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.MailTo;
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
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.iid.FirebaseInstanceId;
import com.google.firebase.iid.InstanceIdResult;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.BufferedInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.URL;
import java.net.URLConnection;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

import static hk.internad.gms.Common.copyFilesAssets;
import static hk.internad.gms.Common.readFile;
import static hk.internad.gms.Common.readInStream;
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
        String NotificationURL =  readFile(dataPath + "/wos/Notification.txt");

        if ( NotificationURL != ""){
            webview.loadUrl("file:///"+ dataPath + "/wos/" + NotificationURL);
            File file = new File(dataPath + "/wos/Notification.txt");
            if (file.exists()) {
                file.delete();
            }
        }else{
            webview.loadUrl("file:///"+ dataPath + "/wos/login.html");
        }

        //showPop(NotificationURL);
    }

    private void showPop(String message){
        new AlertDialog.Builder(MainActivity.this)
                .setTitle("test")//設定視窗標題
                .setIcon(R.mipmap.ic_launcher)//設定對話視窗圖示
                .setMessage(message)//設定顯示的文字
                .setPositiveButton("關閉視窗",new DialogInterface.OnClickListener(){
                    @Override
                    public void onClick(DialogInterface dialog, int which) {
                        dialog.cancel();
                    }
                })//設定結束的子視窗
                .show();//呈現對話視窗
    }

    private void copyHtml(){
        File file = new File(dataPath + "/wos/js/active.js");
        if (!file.exists()) {
            writeFile(dataPath + "/wos/js/active.js","var __activeInfo = { \"token\": \"\", \"expiry_date\": \"\" };");
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
        webview.setVerticalScrollBarEnabled(false);
        webview.setHorizontalScrollBarEnabled(false);
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
                        String webUrl = webview.getOriginalUrl();
                        if (webUrl.contains("?HP")){
                            return  false;
                        }
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
        public void openBrowserInApp(String URL) throws IOException {
            if (URL.startsWith("mailto:")) {
                    MailTo mt = MailTo.parse(URL);
                    Intent i = newEmailIntent( mt.getTo(), mt.getSubject(), mt.getBody(), mt.getCc());
                    startActivity(i);
            }
            else{
                Intent i = new Intent(MainActivity.this, BrowserActivity.class);
                i.putExtra(BrowserActivity.WEBSITE_ADDRESS, URL);
                startActivity(i);
            }
        }

        private Intent newEmailIntent(String address, String subject, String body, String cc) {
            Intent intent = new Intent(Intent.ACTION_SEND);
            intent.putExtra(Intent.EXTRA_EMAIL, new String[] { address });
            intent.putExtra(Intent.EXTRA_TEXT, body);
            intent.putExtra(Intent.EXTRA_SUBJECT, subject);
            intent.putExtra(Intent.EXTRA_CC, cc);
            intent.setType("message/rfc822");
            return intent;
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



    public long getVersionCode() {
        long appVersionCode = 0;
        try {
            PackageInfo packageInfo = getPackageManager().getPackageInfo(getPackageName(), 0);
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                appVersionCode = packageInfo.getLongVersionCode();
            } else {
                appVersionCode = packageInfo.versionCode;
            }
        } catch (PackageManager.NameNotFoundException e) {
            Log.e("", e.getMessage());
        }
        return appVersionCode;
    }


    public long getAppCode(){
        String AppCode =readFile(dataPath + "/wos/appCode.txt");
        return Long.valueOf(AppCode == ""? "0" :AppCode);
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

        public void unpackZip(String path, String zipname) throws Exception
        {
            InputStream is;
            ZipInputStream zis;

            String filename;
            is = new FileInputStream(path + zipname);
            zis = new ZipInputStream(new BufferedInputStream(is));
            ZipEntry ze;
            byte[] buffer = new byte[1024];
            int count;

            while ((ze = zis.getNextEntry()) != null)
            {
                filename = ze.getName();

                // Need to create directories if not exists, or
                // it will generate an Exception...
                if (ze.isDirectory()) {
                    File fmd = new File(path + filename);
                    fmd.mkdirs();
                    continue;
                }else{
                    File file = new File(path +filename);
                    if (!file.exists()) {
                        file.getParentFile().mkdirs();
                        file.createNewFile();
                    }
                }

                FileOutputStream fout = new FileOutputStream(path + filename);

                while ((count = zis.read(buffer)) != -1)
                {
                    fout.write(buffer, 0, count);
                }

                fout.close();
                zis.closeEntry();
                Log.e("unpackZip", filename);
            }

            zis.close();

        }

        protected void onProgressUpdate(String... progress) {
            webview.evaluateJavascript("showDownloadProgress(" + progress[0] + ", 101)", null);
        }


        @Override
        protected void onPostExecute(String result) {
            webview.evaluateJavascript("javascript:doAfterDownloadZip('" + result +"')", null );
        }

    }


}
