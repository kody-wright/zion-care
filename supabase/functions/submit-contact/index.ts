import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders,
    });
  }

  try {
    const {
      first_name,
      last_name,
      email,
      phone,
      reason,
      message,
    } = await req.json();

    // Basic validation
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
          error: "Missing required fields.",
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

    // Supabase server client
    const secretKeys = JSON.parse(
      Deno.env.get("SUPABASE_SECRET_KEYS") || "{}"
    );

    const serviceRoleKey = secretKeys.default;

    if (!serviceRoleKey) {
      throw new Error("Supabase secret key is not configured.");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      serviceRoleKey
    );

    // --------------------------------------------------
    // 1. Save submission
    // --------------------------------------------------

    const { data: submission, error: databaseError } =
      await supabase
        .from("contact_submissions")
        .insert({
          first_name,
          last_name,
          email,
          phone: phone || null,
          reason,
          message,
        })
        .select()
        .single();

    if (databaseError) {
      console.error("Database error:", databaseError);

      return new Response(
        JSON.stringify({
          success: false,
          error: "Unable to save submission.",
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

    // --------------------------------------------------
    // 2. Generate PDF
    // --------------------------------------------------

    const pdfDoc = await PDFDocument.create();

    const page = pdfDoc.addPage([612, 792]);

    const regularFont = await pdfDoc.embedFont(
      StandardFonts.Helvetica
    );

    const boldFont = await pdfDoc.embedFont(
      StandardFonts.HelveticaBold
    );

    const navy = rgb(11 / 255, 34 / 255, 57 / 255);
    const blue = rgb(27 / 255, 79 / 255, 115 / 255);
    const gray = rgb(102 / 255, 116 / 255, 126 / 255);
    const lightGray = rgb(220 / 255, 229 / 255, 235 / 255);

    let y = 735;

    // --------------------------------------------------
    // Header
    // --------------------------------------------------

    page.drawText("ZION CARE", {
      x: 50,
      y,
      size: 24,
      font: boldFont,
      color: navy,
    });

    y -= 24;

    page.drawText("Adult Family Home", {
      x: 52,
      y,
      size: 10,
      font: regularFont,
      color: gray,
    });

    y -= 35;

    page.drawLine({
      start: { x: 50, y },
      end: { x: 562, y },
      thickness: 1,
      color: lightGray,
    });

    y -= 35;

    // --------------------------------------------------
    // Title
    // --------------------------------------------------

    page.drawText("Contact Form Submission", {
      x: 50,
      y,
      size: 18,
      font: boldFont,
      color: navy,
    });

    y -= 30;

    page.drawText(
      `Submission ID: ${submission.id}`,
      {
        x: 50,
        y,
        size: 9,
        font: regularFont,
        color: gray,
      }
    );

    y -= 16;

    const submittedDate = new Date(
      submission.created_at
    ).toLocaleString("en-US", {
      timeZone: "America/Chicago",
      dateStyle: "medium",
      timeStyle: "short",
    });

    page.drawText(
      `Submitted: ${submittedDate}`,
      {
        x: 50,
        y,
        size: 9,
        font: regularFont,
        color: gray,
      }
    );

    y -= 35;

    // --------------------------------------------------
    // Contact Information
    // --------------------------------------------------

    page.drawText("CONTACT INFORMATION", {
      x: 50,
      y,
      size: 10,
      font: boldFont,
      color: blue,
    });

    y -= 25;

    const drawField = (
      label: string,
      value: string,
      currentY: number
    ) => {
      page.drawText(label, {
        x: 50,
        y: currentY,
        size: 9,
        font: boldFont,
        color: gray,
      });

      page.drawText(value || "Not provided", {
        x: 165,
        y: currentY,
        size: 10,
        font: regularFont,
        color: navy,
      });

      return currentY - 22;
    };

    y = drawField(
      "First Name",
      submission.first_name,
      y
    );

    y = drawField(
      "Last Name",
      submission.last_name,
      y
    );

    y = drawField(
      "Email",
      submission.email,
      y
    );

    y = drawField(
      "Phone",
      submission.phone || "Not provided",
      y
    );

    y = drawField(
      "Reason",
      submission.reason,
      y
    );

    y -= 20;

    // --------------------------------------------------
    // Message
    // --------------------------------------------------

    page.drawText("MESSAGE", {
      x: 50,
      y,
      size: 10,
      font: boldFont,
      color: blue,
    });

    y -= 25;

    // Simple word wrapping
    const maxWidth = 500;
    const fontSize = 10;

    const words = submission.message.split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine
        ? `${currentLine} ${word}`
        : word;

      const width = regularFont.widthOfTextAtSize(
        testLine,
        fontSize
      );

      if (width > maxWidth) {
        page.drawText(currentLine, {
          x: 50,
          y,
          size: fontSize,
          font: regularFont,
          color: navy,
        });

        y -= 16;
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      page.drawText(currentLine, {
        x: 50,
        y,
        size: fontSize,
        font: regularFont,
        color: navy,
      });

      y -= 16;
    }

    // --------------------------------------------------
    // Footer
    // --------------------------------------------------

    page.drawLine({
      start: { x: 50, y: 55 },
      end: { x: 562, y: 55 },
      thickness: 1,
      color: lightGray,
    });

    page.drawText(
      "Zion Care | 5915 Saturn Dr, Madison, WI 53718 | 608-209-3204",
      {
        x: 50,
        y: 37,
        size: 8,
        font: regularFont,
        color: gray,
      }
    );

    // --------------------------------------------------
    // Save PDF
    // --------------------------------------------------

    const pdfBytes = await pdfDoc.save();
    const filePath = `${new Date().getFullYear()}/${String(
  new Date().getMonth() + 1
).padStart(2, "0")}/${submission.id}.pdf`;

const { error: uploadError } = await supabase.storage
  .from("contact-submissions")
  .upload(filePath, pdfBytes, {
    contentType: "application/pdf",
    upsert: false,
  });

if (uploadError) {
  console.error("PDF upload error:", uploadError);

  return new Response(
    JSON.stringify({
      success: false,
      error: "PDF was generated but could not be stored.",
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

    // --------------------------------------------------
    // 3. Update database
    // --------------------------------------------------

    const { error: updateError } = await supabase
      .from("contact_submissions")
      .update({
        pdf_generated: true,
      })
      .eq("id", submission.id);

    if (updateError) {
      console.error(
        "PDF status update error:",
        updateError
      );
    }

    // --------------------------------------------------
    // 4. Return PDF
    // --------------------------------------------------

    return new Response(pdfBytes, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="zion-care-contact-${submission.id}.pdf"`,
        "X-Submission-ID": submission.id,
      },
    });

  } catch (error) {
    console.error("Function error:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: "An unexpected error occurred.",
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