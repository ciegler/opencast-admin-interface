import React from "react";
import ReactDOMClient from "react-dom/client";
import "./index.css";
import App from "./App";
import axios from "axios";

// redux imports
import { persistStore } from "redux-persist";
import { PersistGate } from "redux-persist/lib/integration/react";
import { Provider } from "react-redux";
import store from "./store";

// import i18n (needs to be bundled)
import "./i18n/i18n";

// import css files for certain libraries
import "font-awesome/css/font-awesome.min.css";
import "react-datepicker/dist/react-datepicker.css";
import { HotkeysProvider } from "react-hotkeys-hook";
import { ThemeProvider } from "@mui/material";
import { createTheme } from '@mui/material/styles';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { getCurrentLanguageInformation } from "./utils/utils";

// Commenting persistent stuff out can help with debugging
const persistor = persistStore(store);

const theme = createTheme({
	zIndex: {
		modal: 2147483550,
	}
})

if (import.meta.env.DEV && import.meta.env.VITE_TEST_SERVER_URL) {
  axios.defaults.baseURL = import.meta.env.VITE_TEST_SERVER_URL || ""
  axios.defaults.headers.common['Authorization'] = import.meta.env.VITE_TEST_SERVER_AUTH && ("Basic " + window.btoa(import.meta.env.VITE_TEST_SERVER_AUTH));
}

const container = document.getElementById("root");
if (!container) {
	throw new Error("Failed to find the root element");
}
const root = ReactDOMClient.createRoot(container);

root.render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={<div>loading...</div>} persistor={persistor}>
				<ThemeProvider theme={theme}>
					<LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={getCurrentLanguageInformation()?.dateLocale}> {/*locale={getCurrentLanguageInformation()?.dateLocale}> */}
						<HotkeysProvider>
							<App />
						</HotkeysProvider>
					</LocalizationProvider>
				</ThemeProvider>
			</PersistGate>
		</Provider>
	</React.StrictMode>,
);
