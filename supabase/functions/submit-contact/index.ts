import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
        "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", {
            headers: corsHeaders,
        });
    }

    if (req.method !== "POST") {
        return new Response(
            JSON.stringify({
                success: false,
                error: "Method not allowed",
            }),
            {
                status: 405,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            }
        );
    }

    try {
        const body = await req.json();

        const {
            first_name,
            last_name,
            email,
            phone,
            reason,
            message,
        } = body;

        if (
            !first_name ||
            !last_name ||
            !email ||
            !reason ||
            !message
        ) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Please complete all required fields.",
                }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Please provide a valid email address.",
                }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        if (message.length > 5000) {
            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Message is too long.",
                }),
                {
                    status: 400,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        const supabaseUrl = Deno.env.get("SUPABASE_URL");

        /*
         * SUPABASE_SECRET_KEYS is automatically available
         * to Supabase Edge Functions.
         */
        const secretKeys =
            Deno.env.get("SUPABASE_SECRET_KEYS");

        if (!supabaseUrl || !secretKeys) {
            throw new Error(
                "Supabase server configuration is missing."
            );
        }

        const parsedKeys = JSON.parse(secretKeys);

        const secretKey =
            parsedKeys.default;

        if (!secretKey) {
            throw new Error(
                "Supabase default secret key is missing."
            );
        }

        const supabase = createClient(
            supabaseUrl,
            secretKey
        );

        const { data, error } = await supabase
            .from("contact_submissions")
            .insert({
                first_name: first_name.trim(),
                last_name: last_name.trim(),
                email: email.trim().toLowerCase(),
                phone: phone?.trim() || null,
                reason: reason.trim(),
                message: message.trim(),
            })
            .select("id")
            .single();

        if (error) {
            console.error("Database error:", error);

            return new Response(
                JSON.stringify({
                    success: false,
                    error: "Unable to save your message.",
                }),
                {
                    status: 500,
                    headers: {
                        ...corsHeaders,
                        "Content-Type": "application/json",
                    },
                }
            );
        }

        return new Response(
            JSON.stringify({
                success: true,
                message:
                    "Your message has been submitted successfully.",
                submission_id: data.id,
            }),
            {
                status: 200,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            }
        );

    } catch (error) {
        console.error("Function error:", error);

        return new Response(
            JSON.stringify({
                success: false,
                error:
                    "Something went wrong while submitting your message.",
            }),
            {
                status: 500,
                headers: {
                    ...corsHeaders,
                    "Content-Type": "application/json",
                },
            }
        );
    }
});