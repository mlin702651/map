import React, { useState, useEffect } from "react";
import { StyleSheet, Platform, View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Constants from "expo-constants";
import * as Location from "expo-location";
import { Icon } from "react-native-elements";
import metroJson from "./json/metro.json";
import ubikeJson from "./json/ubike.json";
import {VictoryPie} from "victory-native";
import axios from "axios";

const UBIKE_URL =
  "https://data.ntpc.gov.tw/api/datasets/71CD1490-A2DF-4198-BEF1-318479775E8A/json/preview";
  const dataColor = ["#FACFC9", "#5674AC"];

const App = () => {
  const [region, setRegion] = useState({
    longitude: 121.544637,
    latitude: 25.024624,
    longitudeDelta: 0.01,
    latitudeDelta: 0.02,
  });
  const [marker, setMarker] = useState({
    coord: {
      longitude: 121.544637,
      latitude: 25.024624,
    },
    name: "國立臺北教育大學",
    address: "台北市和平東路二段134號",
  });
  const [onCurrentLocation, setOnCurrentLocation] = useState(false);
  const [metro, setMetro] = useState(metroJson);
  const [ubike, setUbike] = useState(ubikeJson);

  const onRegionChangeComplete = (rgn) => {
    if (
      Math.abs(rgn.latitude - region.latitude) > 0.0002 ||
      Math.abs(rgn.longitude - region.longitude) > 0.0002
    ) {
      setRegion(rgn);
      setOnCurrentLocation(false);
    }
  };

  const getUbikeAsync = async () => {
    let response = await axios.get(UBIKE_URL);
    setUbike(response.data);
  };

  const setRegionAndMarker = (location) => {
    setRegion({
      ...region,
      longitude: location.coords.longitude,
      latitude: location.coords.latitude,
    });
    setMarker({
      ...marker,
      coord: {
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
      },
    });
  };

  const getLocation = async () => {
    let { status } = await Location.requestPermissionsAsync();
    if (status !== "granted") {
      setMsg("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    setRegionAndMarker(location);
    setOnCurrentLocation(true);
  };

  useEffect(() => {
    if (Platform.OS === "android" && !Constants.isDevice) {
      setErrorMsg(
        "Oops, this will not work on Sketch in an Android emulator. Try it on your device!"
      );
    } else {
      getLocation();
      getUbikeAsync();
    }
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        region={region}
        style={{ flex: 1 }}
        
        onRegionChangeComplete={onRegionChangeComplete}
      >
        {metro.map((site) => (
          <Marker
            coordinate={{ latitude: site.latitude, longitude: site.longitude }}
            key={`${site.id}${site.line}`}
            title={site.name}
            description={site.address}
          >
            <Image
              source={require("./imgs/metro.png")}
              style={{ width: 26, height: 28 }}
              resizeMode="contain"
            />
          </Marker>
        ))}
        {ubike.map((site) => (
          <Marker
            coordinate={{
              latitude: JSON.parse(site.lat), longitude: JSON.parse(site.lng)
            }}
            key={site.sno}
            title={`${site.sna} ${site.sbi}/${site.tot}`}
            description={site.ar}
          >
              <VictoryPie
                width={150}
                data={[
                  {x:site.tot-site.sbi,y:100-(site.sbi/site.tot)*100},
                  
                  {x:site.sbi,y:(site.sbi/site.tot)*100},
                  
                ]}
                labelRadius={10}
                innerRadius={10}
                colorScale={dataColor}
                />
          </Marker>
        ))}
      </MapView>
      {!onCurrentLocation && (
        <Icon
          raised
          name="ios-locate"
          type="ionicon"
          color="black"
          containerStyle={{
            backgroundColor: "#517fa4",
            position: "absolute",
            right: 20,
            bottom: 40,
          }}
          onPress={getLocation}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ring: {
    width: 40,
    height: 40,
    borderRadius: 40,
    backgroundColor: "rgba(130,4,150, 0.3)",
    borderWidth: 5,
    borderColor: "rgba(130,4,150, 0.5)",
  },
});

export default App;
