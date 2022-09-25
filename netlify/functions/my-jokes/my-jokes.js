const { createClient } = require("@supabase/supabase-js");

// Create a single supabase client for interacting with your database
const supabase = createClient(
	"https://tjnmhtumhyawziflqzso.supabase.co",
	"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqbm1odHVtaHlhd3ppZmxxenNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM5NzI5NjQsImV4cCI6MTk3OTU0ODk2NH0.uEnkQpKqTZUY6zmDb7o3NDjk08dgQZAYy7M47siDU2Y"
);

const CORS_HEADERS = {
	"Access-Control-Allow-Methods": "GET,OPTIONS",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Headers":
		"Origin,XMLHttpRequest,Access-Control-Allow-Origin, X-Requested-With, Content-Type, Accept, Authorization, authorization",
	"Access-Control-Max-Age": "2592000",
	"Access-Control-Allow-Credentials": "true",
	"Content-Type": "application/json",
	Vary: "Origin",
};

const handler = async function (event, context) {
	if (event.httpMethod === "OPTIONS") {
		return {
			statusCode: 200,
			headers: { ...CORS_HEADERS },
			body: JSON.stringify({ message: "Successful preflight call." }),
		};
	}
	
	if (event.httpMethod !== "GET")
		return {
			statusCode: 405,
			body: JSON.stringify({ message: "Must POST to this function"}),
			headers: CORS_HEADERS,
		};

	const token = event.headers["authorization"];

	if (!token) {
		return {
			statusCode: 401,
			body: JSON.stringify({ message: "Token is required" }),
			headers: CORS_HEADERS,
		};
	}

	try {
		const { error, user } = await supabase.auth.api.getUser(token);

		if (error) {
			return {
				headers: CORS_HEADERS,
				statusCode: error.status,
				body: JSON.stringify({
					message: "Invalid token, signOut and retry later",
				}),
			};
		}

		const { data, error: db_error } = await supabase
			.from("jokes")
			.select()
            .eq('createdBy', user.id)

        if(db_error) {
            return {
				headers: CORS_HEADERS,
				statusCode: 400,
				body: JSON.stringify({
					message: db_error.message,
				}),
            }
        }

		return {
			statusCode: 200,
			headers: CORS_HEADERS,
			body: JSON.stringify(data),
		};
	} catch (error) {
		return {
			statusCode: 500,
			headers: CORS_HEADERS,
			body: JSON.stringify({ message: error.message }),
		};
	}
};

module.exports = { handler };
