const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = contactForm.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.innerHTML = "Sending...";

    const formData = new FormData(contactForm);

    const submission = {
      first_name: formData.get("first_name")?.trim(),
      last_name: formData.get("last_name")?.trim(),
      email: formData.get("email")?.trim(),
      phone: formData.get("phone")?.trim(),
      reason: formData.get("reason")?.trim(),
      message: formData.get("message")?.trim(),
    };

    try {
      const { data, error } = await supabaseClient.functions.invoke(
        "submit-contact",
        {
          body: submission,
        },
      );

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Submission successful:", data);

      alert(
        "Thank you for contacting Zion Care. Your message has been submitted.",
      );

      contactForm.reset();
    } catch (error) {
      console.error("Contact form error:", error);

      alert(
        "We were unable to submit your message. Please try again or call Zion Care at 608-209-3204.",
      );
    } finally {
      submitButton.disabled = false;
      submitButton.innerHTML = "Send Message";
    }
  });
}
