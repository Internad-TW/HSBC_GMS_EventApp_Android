package hk.internad.gms;

import android.content.res.AssetManager;
import android.util.Log;

import java.io.BufferedInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;


public class Common {


    /**
     *   將Assets目錄 copy到指定目錄
     * @param AssetsPath Assets目錄
     * @param newPath 指定目錄
     */
    public static void copyFilesAssets(String AssetsPath,String newPath) {
        try {
            AssetManager assetManager = MainApplication.getContext().getAssets();
            String[] files =   assetManager.list(AssetsPath);
            for(String filename : files) {
                try {
                    if (!filename.contains(".")){
                        copyFilesAssets(AssetsPath + "/" + filename,newPath + "/" + filename);
                    }
                    InputStream is = assetManager.open(AssetsPath + "/" + filename);
                    File file = new File(newPath + "/" + filename);
                    if (!file.exists()) {
                        file.getParentFile().mkdirs();
                        file.createNewFile();
                    }
                    FileOutputStream fos = new FileOutputStream(file);
                    byte[] buffer = new byte[1024];
                    int byteCount = 0;
                    while ((byteCount = is.read(buffer)) != -1) {
                        fos.write(buffer, 0, byteCount);
                    }
                    fos.flush();
                    is.close();
                    fos.close();


                } catch (Exception e) {   }
            }
        } catch (Exception e) {
            e.printStackTrace();
            Log.e("Exception",e.fillInStackTrace().toString());
        }


    }

    public static void writeFile(String filePath,String data){

        try {
            File file = new File(filePath);
            if (!file.exists()) {
                file.getParentFile().mkdirs();
                file.createNewFile();
            }
            FileOutputStream outputStream = new FileOutputStream(file);
            outputStream.write(data.getBytes());
            outputStream.close();
        } catch (Exception e) {
            e.printStackTrace();
            Log.e("Exception",e.fillInStackTrace().toString());
        }
    }

    public static String readFile(String filePath){
        String str ="";
        try {
            File file = new File(filePath);
            FileInputStream inStream = new FileInputStream(file);
            str = readInStream(inStream);
            inStream.close();
        } catch (Exception e) {
            e.printStackTrace();
            Log.e("Exception",e.fillInStackTrace().toString());
        }
        return  str;
    }

    public static String readInStream(FileInputStream inStream){
        try {
            ByteArrayOutputStream outStream = new ByteArrayOutputStream();
            byte[] buffer = new byte[1024];
            int length = -1;
            while((length = inStream.read(buffer)) != -1 ){
                outStream.write(buffer, 0, length);
            }
            outStream.close();
            inStream.close();
            return outStream.toString();
        } catch (IOException e){
            e.printStackTrace();
            Log.e("Exception",e.fillInStackTrace().toString());
        }
        return null;
    }

    public static void unpackZip(String path, String zipname) throws Exception
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
}
