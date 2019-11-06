package hk.internad.gms;

import android.os.Bundle;
import android.app.Activity;
import android.support.annotation.Nullable;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class BrowserActivity extends Activity {


    public static final String WEBSITE_ADDRESS = "website_address";
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        String url  = getIntent().getStringExtra(WEBSITE_ADDRESS);
        if (url == null || url.isEmpty()) finish();

        setContentView(R.layout.activity_browser);
        WebView webView = (WebView) findViewById(R.id.webview);
        webView.getSettings().setJavaScriptEnabled(true);
        webView.setWebViewClient(new WebViewClient());
        webView.loadUrl(url);
    }


    public void click(View view){
        finish();
    }
}
