package com.example.carmelapos

import android.annotation.SuppressLint
import android.os.Bundle
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.activity.ComponentActivity
import androidx.activity.OnBackPressedCallback
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.systemBarsPadding
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.viewinterop.AndroidView

class MainActivity : ComponentActivity() {

    private var webView: WebView? = null

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView?.canGoBack() == true) {
                    webView?.goBack()
                } else {
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                }
            }
        })

        setContent {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xFF0B0F19))
                    .systemBarsPadding()
            ) {
                AndroidView(
                    modifier = Modifier.fillMaxSize(),
                    factory = { context ->
                        WebView(context).apply {
                            webView = this
                            setBackgroundColor(0xFF0B0F19.toInt())
                            settings.apply {
                                javaScriptEnabled = true
                                domStorageEnabled = true
                                databaseEnabled = true
                                allowFileAccess = true
                                allowContentAccess = true
                                loadWithOverviewMode = true
                                useWideViewPort = true
                                cacheMode = WebSettings.LOAD_DEFAULT
                                setSupportZoom(false)
                            }
                            webChromeClient = WebChromeClient()
                            webViewClient = WebViewClient()
                            loadUrl("file:///android_asset/index.html")
                        }
                    }
                )
            }
        }
    }
}
