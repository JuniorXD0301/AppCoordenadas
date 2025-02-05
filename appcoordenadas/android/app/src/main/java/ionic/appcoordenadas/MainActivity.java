package ionic.appcoordenadas;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.appcoordenadas.plugins.locationdetector.locationDetectorPlugin;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstaceState){
        registerPlugin(locationDetectorPlugin.class);
        super.onCreate(savedInstaceState);
    }
}
