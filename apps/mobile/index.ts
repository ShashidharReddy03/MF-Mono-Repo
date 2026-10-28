// Order matters: configure @mf-bank/shared BEFORE any screen module loads.
import "./src/app/bootstrap";
import "./global.css";
import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import App from "./src/app/App";

registerRootComponent(App);
