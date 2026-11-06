package uz.wordly.app;

import android.Manifest;
import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.speech.RecognitionListener;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.tts.TextToSpeech;
import android.speech.tts.UtteranceProgressListener;
import android.speech.tts.Voice;
import android.view.WindowInsets;
import android.webkit.JsPromptResult;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.ArrayList;
import java.util.Locale;

public final class MainActivity extends Activity {
    private static final String HOME = "https://wordly-one-nu.vercel.app/";
    private WebView web;
    private SpeechRecognizer recognizer;
    private TextToSpeech tts;
    private boolean ttsReady, foreground, errorVisible, askingPermission;
    private int speechId, pendingSpeech;

    private boolean trusted(String value) {
        if (value == null) return false;
        Uri uri = Uri.parse(value);
        return "https".equals(uri.getScheme()) && "wordly-one-nu.vercel.app".equals(uri.getHost())
            && uri.getUserInfo() == null && (uri.getPort() == -1 || uri.getPort() == 443);
    }

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(Color.rgb(12,16,32));
        getWindow().setNavigationBarColor(Color.rgb(12,16,32));
        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.rgb(12,16,32));
        web = new WebView(this);root.addView(web);setContentView(root);
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            root.setOnApplyWindowInsetsListener((view,insets)->{
                android.graphics.Insets bars=insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.displayCutout() | WindowInsets.Type.ime());
                view.setPadding(bars.left,bars.top,bars.right,bars.bottom);
                return WindowInsets.CONSUMED;
            });
        }
        WebSettings settings=web.getSettings();
        settings.setJavaScriptEnabled(true);settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);settings.setAllowContentAccess(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setMediaPlaybackRequiresUserGesture(true);
        settings.setUserAgentString(settings.getUserAgentString()+" WordlyAndroid/1.0");
        web.setBackgroundColor(Color.rgb(12,16,32));
        web.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view,WebResourceRequest request){
                String url=request.getUrl().toString();
                if(trusted(url))return false;
                if(request.isForMainFrame() && request.hasGesture())openBrowser(url);
                return true;
            }
            @Override public void onPageStarted(WebView view,String url,android.graphics.Bitmap icon){cancelSpeech();}
            @Override public void onPageFinished(WebView view,String url){if(trusted(url))publishVoices();}
            @Override public void onReceivedError(WebView view,WebResourceRequest request,WebResourceError error){
                if(!request.isForMainFrame()||isFinishing()||errorVisible)return;
                errorVisible=true;
                new AlertDialog.Builder(MainActivity.this).setTitle("Internetni tekshiring")
                    .setMessage("WORDLY ochilmadi. Natijalaringiz telefonda saqlangan.")
                    .setPositiveButton("Qayta urinish",(dialog,which)->web.loadUrl(HOME+"#units"))
                    .setNegativeButton("Yopish",(dialog,which)->finish())
                    .setOnDismissListener(dialog->errorVisible=false).show();
            }
        });
        web.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onJsPrompt(WebView view,String url,String message,String defaultValue,JsPromptResult result){
                if(!message.startsWith("wordly-native:"))return super.onJsPrompt(view,url,message,defaultValue,result);
                result.confirm("");
                if(!trusted(url)||!trusted(view.getUrl())||!foreground)return true;
                try{
                    JSONObject data=new JSONObject(message.substring(14));
                    int id=data.optInt("id",0);
                    switch(data.optString("action")){
                        case "listen": requestSpeech(id);break;
                        case "abort": if(id==speechId||id==pendingSpeech)cancelSpeech();break;
                        case "speak": speak(data);break;
                        case "tts-stop": if(tts!=null)tts.stop();break;
                        case "browser": if(trusted(data.optString("url")))openBrowser(data.optString("url"));break;
                    }
                }catch(Exception ignored){}
                return true;
            }
        });
        tts=new TextToSpeech(this,status->{ttsReady=status==TextToSpeech.SUCCESS;publishVoices();});
        tts.setOnUtteranceProgressListener(new UtteranceProgressListener(){
            @Override public void onStart(String id){}
            @Override public void onDone(String id){ttsEvent(id,"tts-end");}
            @Override public void onError(String id){ttsEvent(id,"tts-error");}
        });
        if(state==null||web.restoreState(state)==null)web.loadUrl(HOME+"#units");
    }

    private void openBrowser(String url){
        Uri uri=Uri.parse(url);
        if(!"https".equals(uri.getScheme()))return;
        try{startActivity(new Intent(Intent.ACTION_VIEW,uri));}catch(Exception ignored){}
    }
    private void event(int id,String type,Object data){
        runOnUiThread(()->{if(web!=null&&trusted(web.getUrl()))web.evaluateJavascript(
            "window.wordlyNativeEvent&&window.wordlyNativeEvent("+id+","+JSONObject.quote(type)+","+(data==null?"null":data instanceof JSONArray?data.toString():JSONObject.quote(data.toString()))+")",null);});
    }
    private void requestSpeech(int id){
        if(id<=0)return;
        cancelSpeech();pendingSpeech=id;
        if(checkSelfPermission(Manifest.permission.RECORD_AUDIO)!=PackageManager.PERMISSION_GRANTED){
            askingPermission=true;
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO},11);return;
        }
        startSpeech(id);
    }
    private void startSpeech(final int id){
        pendingSpeech=0;speechId=id;
        if(!SpeechRecognizer.isRecognitionAvailable(this)){event(id,"error","service-not-allowed");return;}
        try{
            recognizer=SpeechRecognizer.createSpeechRecognizer(this);
            recognizer.setRecognitionListener(new RecognitionListener(){
                private boolean current(){return speechId==id && foreground;}
                @Override public void onReadyForSpeech(Bundle values){if(current())event(id,"start",null);}
                @Override public void onBeginningOfSpeech(){}
                @Override public void onRmsChanged(float rms){}
                @Override public void onBufferReceived(byte[] buffer){}
                @Override public void onEndOfSpeech(){}
                @Override public void onPartialResults(Bundle values){}
                @Override public void onEvent(int type,Bundle values){}
                @Override public void onResults(Bundle values){
                    if(!current())return;
                    ArrayList<String> words=values.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION);
                    event(id,"result",words==null?new JSONArray():new JSONArray(words));event(id,"end",null);
                }
                @Override public void onError(int error){
                    if(!current())return;
                    String reason=error==SpeechRecognizer.ERROR_INSUFFICIENT_PERMISSIONS?"not-allowed":
                        error==SpeechRecognizer.ERROR_NO_MATCH||error==SpeechRecognizer.ERROR_SPEECH_TIMEOUT?"no-speech":
                        error==SpeechRecognizer.ERROR_NETWORK||error==SpeechRecognizer.ERROR_NETWORK_TIMEOUT?"network":"audio-capture";
                    event(id,"error",reason);event(id,"end",null);
                }
            });
            Intent intent=new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            intent.putExtra(RecognizerIntent.EXTRA_LANGUAGE,"en-US");
            intent.putExtra(RecognizerIntent.EXTRA_MAX_RESULTS,5);
            recognizer.startListening(intent);
        }catch(Exception error){cancelSpeech();event(id,"error","audio-capture");}
    }
    private void cancelSpeech(){
        speechId=0;pendingSpeech=0;
        if(recognizer!=null){recognizer.cancel();recognizer.destroy();recognizer=null;}
    }
    @Override public void onRequestPermissionsResult(int request,String[] permissions,int[] grants){
        super.onRequestPermissionsResult(request,permissions,grants);
        if(request!=11)return;
        askingPermission=false;
        int id=pendingSpeech;
        if(id==0)return;
        if(grants.length>0&&grants[0]==PackageManager.PERMISSION_GRANTED&&trusted(web.getUrl())){if(foreground)startSpeech(id);}
        else{pendingSpeech=0;event(id,"error","not-allowed");}
    }
    private void publishVoices(){
        if(tts==null||!ttsReady||web==null||!trusted(web.getUrl()))return;
        JSONArray voices=new JSONArray();
        if(tts.getVoices()!=null)for(Voice voice:tts.getVoices()){
            try{JSONObject value=new JSONObject();value.put("name",voice.getName());value.put("lang",voice.getLocale().toLanguageTag());voices.put(value);}catch(Exception ignored){}
        }
        web.evaluateJavascript("window.WordlyNativeVoices="+voices.toString(),null);
    }
    private void speak(JSONObject data){
        int id=data.optInt("id",0);String text=data.optString("text","");
        if(tts==null||!ttsReady||text.length()>2000){event(id,"tts-error",null);return;}
        int available=tts.setLanguage(Locale.forLanguageTag(data.optString("lang","en-GB")));
        if(available<0){event(id,"tts-error",null);return;}
        tts.setSpeechRate((float)Math.max(.5,Math.min(1.5,data.optDouble("rate",1))));
        if(tts.speak(text,TextToSpeech.QUEUE_FLUSH,null,Integer.toString(id))==TextToSpeech.ERROR)event(id,"tts-error",null);
    }
    private void ttsEvent(String id,String type){try{event(Integer.parseInt(id),type,null);}catch(Exception ignored){}}
    @Override protected void onResume(){
        super.onResume();foreground=true;if(web!=null)web.onResume();
        if(pendingSpeech>0&&!askingPermission&&checkSelfPermission(Manifest.permission.RECORD_AUDIO)==PackageManager.PERMISSION_GRANTED&&trusted(web.getUrl()))startSpeech(pendingSpeech);
    }
    @Override protected void onPause(){
        foreground=false;if(tts!=null)tts.stop();
        // PermissionController may pause this Activity before returning the grant.
        if(!askingPermission){
            cancelSpeech();
            if(web!=null){web.evaluateJavascript("if(typeof session!=='undefined'&&session?.mode==='voice'&&!session.checked)pauseVoiceRound();if(typeof stopAnswerAudio==='function')stopAnswerAudio()",null);web.onPause();web.clearFocus();}
        }
        super.onPause();
    }
    @Override protected void onSaveInstanceState(Bundle state){web.saveState(state);super.onSaveInstanceState(state);}
    @Override public void onBackPressed(){
        web.evaluateJavascript("(()=>{if(typeof session!=='undefined'&&session){action('exit');return true}if(location.hash&&location.hash!=='#units'){location.hash='#units';return true}return false})()",handled->{if(!"true".equals(handled))finish();});
    }
    @Override protected void onDestroy(){cancelSpeech();if(tts!=null){tts.stop();tts.shutdown();}if(web!=null){web.destroy();web=null;}super.onDestroy();}
}
