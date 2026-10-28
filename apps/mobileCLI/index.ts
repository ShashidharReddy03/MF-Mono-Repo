// Order matters: configure @mf-bank/shared BEFORE any screen module loads.
import "./src/app/bootstrap";
import "./global.css";
import "react-native-gesture-handler";
import { AppRegistry } from "react-native";
import App from "./src/app/App";
import { name as appName } from "./app.json";

AppRegistry.registerComponent(appName, () => App);
