
document.addEventListener("DOMContentLoaded", () => {
    // Override this before script.js is loaded when the API is hosted elsewhere.
    const apiBaseUrl = window.HIGOLD_API_BASE_URL || "http://127.0.0.1:8000/api/v1";
    const form = document.getElementById("enquiryForm");
    const steps = [...document.querySelectorAll(".form-step")];
    const progressSteps = [
        ...document.querySelectorAll(".progress-step")
    ];

    const backBtn = document.getElementById("backBtn");
    const nextBtn = document.getElementById("nextBtn");
    const submitBtn = document.getElementById("submitBtn");
    const footerStep = document.getElementById("footerStep");

    const categoryCount = document.getElementById("categoryCount");
    const categoryError = document.getElementById("categoryError");
    const submitError = document.getElementById("submitError");

    const successMessage = document.getElementById("successMessage");
    const formFooter = document.getElementById("formFooter");
    const restartBtn = document.getElementById("restartBtn");

    let currentStep = 1;

    // --------------------------------------
    // Show a particular step
    // --------------------------------------

    function showStep(stepNumber, shouldScroll = true) {
        currentStep = stepNumber;

        steps.forEach((step) => {
            const isActive = Number(step.dataset.step) === stepNumber;

            step.hidden = !isActive;
            step.classList.toggle("active", isActive);
        });

        progressSteps.forEach((step) => {
            const number = Number(step.dataset.progress);

            step.classList.toggle("active", number === stepNumber);
            step.classList.toggle("completed", number < stepNumber);

            if (number < stepNumber) {
                step.querySelector(".step-number").textContent = "✓";
            } else {
                step.querySelector(".step-number").textContent = number;
            }

            if (number === stepNumber) {
                step.setAttribute("aria-current", "step");
            } else {
                step.removeAttribute("aria-current");
            }
        });

        backBtn.hidden = stepNumber === 1;
        nextBtn.hidden = stepNumber === 3;
        submitBtn.hidden = stepNumber !== 3;

        footerStep.textContent = `Step ${stepNumber} of 3`;

        if (shouldScroll) {
            const card = document.querySelector(".enquiry-card");
            const rect = card.getBoundingClientRect();

            if (rect.top < 0 || rect.top > 100) {
                card.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }
        }
    }

    // --------------------------------------
    // Customer type: single selection
    // --------------------------------------

    const customerOptions = [
        ...document.querySelectorAll(".customer-option")
    ];

    document
        .querySelectorAll('input[name="customer_type"]')
        .forEach((radio) => {
            radio.addEventListener("change", () => {
                customerOptions.forEach((option) => {
                    const input = option.querySelector(
                        'input[name="customer_type"]'
                    );

                    option.classList.toggle(
                        "selected",
                        input.checked
                    );
                });
            });
        });

    // --------------------------------------
    // Product categories: multiple selection
    // --------------------------------------

    const categoryCards = [
        ...document.querySelectorAll(".category-card")
    ];

    function updateCategories() {
        const checked = document.querySelectorAll(
            'input[name="categories[]"]:checked'
        );

        categoryCards.forEach((card) => {
            const input = card.querySelector(
                'input[name="categories[]"]'
            );

            card.classList.toggle("selected", input.checked);
        });

        const count = checked.length;

        categoryCount.textContent =
            `${count} ${count === 1 ? "category" : "categories"} selected`;

        categoryError.hidden = true;
    }

    document
        .querySelectorAll('input[name="categories[]"]')
        .forEach((checkbox) => {
            checkbox.addEventListener("change", updateCategories);
        });

    // --------------------------------------
    // Field validation helpers
    // --------------------------------------

    function showFieldError(input, message) {
        const group = input.closest(".form-group");
        const error = group.querySelector(".field-error");

        input.classList.add("invalid");
        input.setAttribute("aria-invalid", "true");

        error.textContent = message;
        error.classList.add("visible");
    }

    function clearFieldError(input) {
        const group = input.closest(".form-group");
        const error = group.querySelector(".field-error");

        input.classList.remove("invalid");
        input.removeAttribute("aria-invalid");

        error.textContent = "";
        error.classList.remove("visible");
    }

    function validateField(input) {
        const value = input.value.trim();
        const id = input.id;

        clearFieldError(input);

        if (input.required && !value) {
            showFieldError(input, "This field is required.");
            return false;
        }

        if (!value) {
            return true;
        }

        if (id === "fullName") {
            if (value.length < 2) {
                showFieldError(
                    input,
                    "Please enter your full name."
                );
                return false;
            }
        }

        if (id === "mobile") {
            // Indian mobile numbers: 10 digits, starting from 6–9.
            if (!/^[6-9]\d{9}$/.test(value)) {
                showFieldError(
                    input,
                    "Enter a valid 10-digit Indian mobile number."
                );
                return false;
            }
        }

        if (id === "pincode") {
            // Indian PIN codes: 6 digits, first digit 1–9.
            if (!/^[1-9]\d{5}$/.test(value)) {
                showFieldError(
                    input,
                    "Enter a valid 6-digit PIN code."
                );
                return false;
            }
        }

        if (id === "city") {
            if (value.length < 2) {
                showFieldError(
                    input,
                    "Please enter a valid city name."
                );
                return false;
            }
        }

        if (id === "email") {
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(value)) {
                showFieldError(
                    input,
                    "Please enter a valid email address."
                );
                return false;
            }
        }

        return true;
    }

    function validateStepTwo() {
        const fields = [
            document.getElementById("fullName"),
            document.getElementById("mobile"),
            document.getElementById("pincode"),
            document.getElementById("city"),
            document.getElementById("email")
        ];

        let isValid = true;
        let firstInvalidField = null;

        fields.forEach((field) => {
            const valid = validateField(field);

            if (!valid) {
                isValid = false;

                if (!firstInvalidField) {
                    firstInvalidField = field;
                }
            }
        });

        if (firstInvalidField) {
            firstInvalidField.focus();
        }

        return isValid;
    }

    // Remove errors while the user corrects a field.
    document.querySelectorAll(".form-group input").forEach((input) => {
        input.addEventListener("input", () => {
            clearFieldError(input);

            if (input.id === "mobile") {
                input.value = input.value.replace(/\D/g, "").slice(0, 10);
            }

            if (input.id === "pincode") {
                input.value = input.value.replace(/\D/g, "").slice(0, 6);
            }
        });

        input.addEventListener("blur", () => {
            if (input.value.trim()) {
                validateField(input);
            }
        });
    });

    // --------------------------------------
    // Continue button
    // --------------------------------------

    nextBtn.addEventListener("click", () => {
        if (currentStep === 1) {
            const selectedCustomer = document.querySelector(
                'input[name="customer_type"]:checked'
            );

            if (!selectedCustomer) {
                alert("Please select a customer type.");
                return;
            }

            showStep(2);
            return;
        }

        if (currentStep === 2) {
            if (!validateStepTwo()) {
                return;
            }

            showStep(3);
        }
    });

    // --------------------------------------
    // Back button
    // --------------------------------------

    backBtn.addEventListener("click", () => {
        if (currentStep > 1) {
            showStep(currentStep - 1);
        }
    });

    // --------------------------------------
    // Submit form
    // --------------------------------------

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (currentStep !== 3) {
            return;
        }

        const selectedCategories = [
            ...document.querySelectorAll(
                'input[name="categories[]"]:checked'
            )
        ];

        if (selectedCategories.length === 0) {
            categoryError.hidden = false;
            categoryCount.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
            return;
        }

        categoryError.hidden = true;

        // Collect all form values.
        const formData = new FormData(form);

        const enquiry = {
            customer_type: formData.get("customer_type") === "business"
                ? "Commercial"
                : "Individual",
            name: formData.get("name").trim(),
            mobile: `+91 ${formData.get("mobile").trim()}`,
            pincode: formData.get("pincode").trim(),
            city: formData.get("city").trim(),
            interests: formData.getAll("categories[]")
        };
        const email = formData.get("email").trim();
        if (email) enquiry.email = email;

        submitError.hidden = true;
        submitError.textContent = "";
        submitBtn.disabled = true;
        submitBtn.setAttribute("aria-busy", "true");

        try {
            const response = await fetch(`${apiBaseUrl}/customer-details`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(enquiry)
            });

            const result = await response.json().catch(() => ({}));
            if (!response.ok) {
                if (response.status === 422 && result.errors) {
                    showApiValidationErrors(result.errors);
                    return;
                }
                throw new Error(response.status === 429
                    ? "Too many submissions. Please wait a minute and try again."
                    : (result.message || "We could not submit your enquiry. Please try again."));
            }

            successMessage.querySelector(".success-copy").textContent =
                result.message || "Your enquiry has been submitted successfully.";

            form.hidden = true;
            formFooter.hidden = true;
            successMessage.hidden = false;

            successMessage.scrollIntoView({ behavior: "smooth", block: "center" });
        } catch (error) {
            submitError.textContent = error.message || "Unable to reach the server. Check your connection and try again.";
            submitError.hidden = false;
            submitError.scrollIntoView({ behavior: "smooth", block: "center" });
        } finally {
            submitBtn.disabled = false;
            submitBtn.removeAttribute("aria-busy");
        }
    });

    function showApiValidationErrors(errors) {
        const fieldMap = {
            name: "fullName",
            mobile: "mobile",
            pincode: "pincode",
            city: "city",
            email: "email"
        };
        let firstField = null;
        Object.entries(fieldMap).forEach(([key, id]) => {
            const input = document.getElementById(id);
            if (errors[key]?.length) {
                showFieldError(input, errors[key][0]);
                firstField ||= input;
            }
        });
        if (errors.customer_type?.length) {
            submitError.textContent = errors.customer_type[0];
            submitError.hidden = false;
        }
        if (errors.interests?.length || errors["interests.0"]?.length) {
            categoryError.textContent = errors.interests?.[0] || errors["interests.0"][0];
            categoryError.hidden = false;
        }
        if (firstField) {
            showStep(2);
            firstField.focus();
        } else if (errors.interests?.length || errors["interests.0"]?.length) {
            categoryError.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }

    // --------------------------------------
    // Restart the form
    // --------------------------------------

    restartBtn.addEventListener("click", () => {
        form.reset();

        document
            .querySelectorAll(".field-error")
            .forEach((error) => {
                error.textContent = "";
                error.classList.remove("visible");
            });

        document
            .querySelectorAll(".form-group input")
            .forEach((input) => {
                input.classList.remove("invalid");
                input.removeAttribute("aria-invalid");
            });

        categoryError.hidden = true;
        categoryError.textContent = "Please select at least one product category.";
        submitError.hidden = true;
        submitError.textContent = "";

        form.hidden = false;
        formFooter.hidden = false;
        successMessage.hidden = true;

        updateCategories();
        showStep(1, false);

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });

    // Initialise the form.
    updateCategories();
    showStep(1, false);
});
