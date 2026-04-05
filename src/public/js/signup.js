 // Image Preview Logic
        const imageInput = document.getElementById('memberImage');
        const preview = document.getElementById('profilePreview');
        const icon = document.getElementById('uploadIcon');
        const hint = document.getElementById('uploadHint');

        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.classList.remove('hidden');
                    icon.classList.add('hidden');
                }
                reader.readAsDataURL(file);
            }
        });

        // Validation Logic
        document.getElementById('signupForm').addEventListener('submit', function(e) {
            const password = document.getElementById('memberPassword').value;
            const confirm = document.getElementById('confirmPassword').value;
            const fileInput = document.getElementById('memberImage');

            let errors = [];

            if (!fileInput.files[0]) {
                errors.push("Restaurant image is mandatory.");
                hint.classList.add('text-error', 'font-bold');
            }


            if (password !== confirm) {
                errors.push("Password differs, please check!.");
                document.getElementById('confirmPassword').classList.add('border-b-2', 'border-error');
            }

            if (password.length < 6) {
                errors.push("Password must be at least 6 characters.");
            }

            if (errors.length > 0) {
                e.preventDefault();
                alert(errors.join("\n"));
            }
        });