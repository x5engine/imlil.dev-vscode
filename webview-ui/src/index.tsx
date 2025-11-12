import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "./index.css"
import App from "./App"
import "../node_modules/@vscode/codicons/dist/codicon.css"
import "./codicon-custom.css" // kilocode_change

import { getHighlighter } from "./utils/highlighter"

// Initialize Shiki early to hide initialization latency (async)
getHighlighter().catch((error: Error) => console.error("Failed to initialize Shiki highlighter:", error))

// RTL Support: Detect and set document direction based on language
function setDocumentDirection() {
	// Get language from browser or VS Code settings
	const browserLang = navigator.language || navigator.languages?.[0] || "en"
	const lang = browserLang.split("-")[0].toLowerCase()
	
	// Arabic and Hebrew are RTL languages
	const rtlLanguages = ["ar", "he", "fa", "ur"]
	const isRTL = rtlLanguages.includes(lang)
	
	// Set document direction
	document.documentElement.dir = isRTL ? "rtl" : "ltr"
	document.documentElement.lang = browserLang
	
	// Store in localStorage for persistence
	if (isRTL) {
		localStorage.setItem("imlil-dev-direction", "rtl")
	} else {
		localStorage.setItem("imlil-dev-direction", "ltr")
	}
}

// Set direction on initial load
setDocumentDirection()

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<App />
	</StrictMode>,
)
