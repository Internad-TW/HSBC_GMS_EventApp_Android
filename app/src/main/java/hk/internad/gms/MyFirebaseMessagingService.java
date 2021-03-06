package hk.internad.gms;

import android.app.AlertDialog;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.media.RingtoneManager;
import android.net.Uri;
import android.support.v4.app.NotificationCompat;
import android.util.Log;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;

import java.util.Map;

import static hk.internad.gms.Common.writeFile;

public class MyFirebaseMessagingService extends FirebaseMessagingService {

    private static final String TAG = "MyFirebaseMsgService";

    @Override
    public void onCreate() {
        super.onCreate();
    }

    @Override
    public void onMessageReceived(RemoteMessage remoteMessage) {
        super.onMessageReceived(remoteMessage);
        Log.i("Service", "onMessageReceived: " + remoteMessage.getFrom());
        if (remoteMessage.getData().size() > 0) {
            Log.i("Service", "" + remoteMessage.getData());
            String eventId  =  remoteMessage.getData().get("eventId");
            String newsId  = remoteMessage.getData().get("newsId");
            String type  = remoteMessage.getData().get("type");
            String Title  =   remoteMessage.getNotification().getTitle();
            Title.replace("\\","|#1#|");
            Title.replace("\"","|#2#|");
            Title.replace("\'","|#3#|");
            String dataPath = getFilesDir().getAbsolutePath();
            if (type.toLowerCase() == "news"){
                writeFile(dataPath + "/wos/Notification.txt", "{\"id\":" + eventId + ", \"message\": \"" + Title + "\"}");
            }
        }
        if (remoteMessage.getNotification() != null) {
            Log.i("Service", "" + remoteMessage.getNotification().getTitle());
            sendNotification(remoteMessage.getNotification().getTitle());
        }
    }

    @Override
    public void onMessageSent(String s) {
        super.onMessageSent(s);
        Log.i("Service", "onMessageSent" + s);
    }

    private void sendNotification(String messageBody) {
        Intent intent = new Intent(this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
        PendingIntent pendingIntent = PendingIntent.getActivity(this, 0 /* Request code */, intent,
                PendingIntent.FLAG_ONE_SHOT);

        Uri defaultSoundUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION);
        NotificationCompat.Builder notificationBuilder = new NotificationCompat.Builder(this)
                .setSmallIcon(R.mipmap.ic_launcher)
                .setContentText(messageBody)
                .setAutoCancel(true)
                .setSound(defaultSoundUri)
                .setContentIntent(pendingIntent);

        NotificationManager notificationManager =
                (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
        notificationManager.notify(0 /* ID of notification */, notificationBuilder.build());
    }
}
