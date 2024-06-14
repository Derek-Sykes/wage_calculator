// middleware/globals.js

export function attachGlobals(req, res, next) {
	req.globalVars = req.app.locals.globalVars;
	next();
}
