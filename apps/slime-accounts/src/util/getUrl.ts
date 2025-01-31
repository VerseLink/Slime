export function getFrontendUrl(path: string) {
	return import.meta.env.MODE === 'development' ? `http://127.0.0.1:5100${path}` : path;
}

export function getApiUrl(path: string) {
	return import.meta.env.MODE === 'development' ? `http://127.0.0.1:8810${path}` : path;
}