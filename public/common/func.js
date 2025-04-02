$(document).ready(function () {
    $(".rating.unlocked").each(function () {
        let ratingValue = $(this).data("rating") || 0;
        $(this).css("--rating", ratingValue);
    });

    $(".star").on("click", function () {
        let ratingValue = $(this).data("value");
        let ratingElement = $(this).closest(".rating");

        ratingElement.css("--rating", ratingValue);
        ratingElement.attr("data-rating", ratingValue);

        console.log("You selected: " + ratingValue + " stars ⭐");
    });

    $(".dropdown-btn").click(function (event) {
        event.stopPropagation(); // Prevents click from propagating
        $(this).siblings(".dropdown-content").toggleClass("show");
    });

    $(".toggle-btn").click(function () {
        let parentContainer = $(this).closest(".like-container");
    
        $(this).toggleClass("on"); // toggle on
    
        if ($(this).closest("#like").length) {
            // remove on from dislike
            parentContainer.find("#dislike").removeClass("on");
        } else if ($(this).closest("#dislike").length) {
            // remove on from like
            parentContainer.find("#like").removeClass("on");
        }
    });

    $(".dropdown-content p").click(function () {
        let selectedText = $(this).text();
        let arrowGraphic = '\n<img src="https://static.vecteezy.com/system/resources/previews/014/455/895/non_2x/down-arrow-icon-on-transparent-background-free-png.png" height="10vh" width="10vh">'

        // Hide dropdown
        let dropdown = $(this).closest(".dropdown");
        dropdown.find(".dropdown-btn").html(selectedText+arrowGraphic);
        dropdown.find(".dropdown-content").removeClass("show"); 

        $(this).siblings().removeClass("selected");
        $(this).addClass("selected");

        let selectedType = $(".type-filter.selected").data("type") || undefined;
        let selectedRating = $(".rating-filter.selected").data("rating") || undefined;
        let selectedPricingFrom = $(".pricing-filter-min.selected").data("pricing_from") || undefined;
        let selectedPricingTo = $(".pricing-filter-max.selected").data("pricing_to") || undefined;
        let searchQuery = $(".headerViewRestaurants").data("search-query") || undefined;

        $.post('ajax_response_restaurants', { type: selectedType, rating: selectedRating, pricing_from: selectedPricingFrom, pricing_to: selectedPricingTo, searchQuery: searchQuery },
            function(data, status){
                if(status == 'success') {
                    let stackHtml = "";

                    data.forEach(restaurant => {
                        stackHtml += `
                            <div class="food-card-vertical">
                                <div class="horizontalAlignment">
                                    <div class="food-card" onclick="window.location.href='/view/restaurant/${restaurant._id}'">
                                        <img src="${restaurant.picture_address}" class="food-card">
                                    </div>
                                    <div class="food-details" id="card-stack">
                                        <div class="horizontalAlignment">
                                            <h2>${restaurant.name}</h2>
                                            <p class="rating" style="--rating: ${restaurant.rating};"></p>
                                        </div>
                                        <p>Type: ${restaurant.type}</p>
                                        <p>Address: ${restaurant.address}</p>
                                        <p>Phone Number: ${restaurant.phone_number}</p>
                                        <p>Pricing: PHP ${restaurant.pricing_from}-${restaurant.pricing_to} per person</p>
                                    </div>
                                </div>
                                <br>
                            </div>
                        `;
                    });

                    $(".restaurantCategory").html(stackHtml);
                }
            }
        )
    });

    $("#clear-btn").click(function () {
        $("#filterFood-btn .dropdown-btn").html('Food Type <img src="https://static.vecteezy.com/system/resources/previews/014/455/895/non_2x/down-arrow-icon-on-transparent-background-free-png.png" height="10vh" width="10vh">');
        $("#filterRating-btn .dropdown-btn").html('Average Rating <img src="https://static.vecteezy.com/system/resources/previews/014/455/895/non_2x/down-arrow-icon-on-transparent-background-free-png.png" height="10vh" width="10vh">');
        $("#filterPriceMin-btn .dropdown-btn").html('Minimum Pricing <img src="https://static.vecteezy.com/system/resources/previews/014/455/895/non_2x/down-arrow-icon-on-transparent-background-free-png.png" height="10vh" width="10vh">');
        $("#filterPriceMax-btn .dropdown-btn").html('Maximum Pricing <img src="https://static.vecteezy.com/system/resources/previews/014/455/895/non_2x/down-arrow-icon-on-transparent-background-free-png.png" height="10vh" width="10vh">');

        $(".dropdown-content p").removeClass("selected");

        let selectedType = undefined;
        let selectedRating = undefined;
        let selectedPricingFrom = undefined;
        let selectedPricingTo = undefined;
        let searchQuery = $(".headerViewRestaurants").data("search-query") || undefined;

        $.post('ajax_response_restaurants', { type: selectedType, rating: selectedRating, pricing_from: selectedPricingFrom, pricing_to: selectedPricingTo, searchQuery: searchQuery },
            function(data, status){
                if(status == 'success') {
                    let stackHtml = "";

                    data.forEach(restaurant => {
                        stackHtml += `
                            <div class="food-card-vertical">
                                <div class="horizontalAlignment">
                                    <div class="food-card" onclick="window.location.href='/view/restaurant/${restaurant._id}'">
                                        <img src="${restaurant.picture_address}" class="food-card">
                                    </div>
                                    <div class="food-details" id="card-stack">
                                        <div class="horizontalAlignment">
                                            <h2>${restaurant.name}</h2>
                                            <p class="rating" style="--rating: ${restaurant.rating};"></p>
                                        </div>
                                        <p>Type: ${restaurant.type}</p>
                                        <p>Address: ${restaurant.address}</p>
                                        <p>Phone Number: ${restaurant.phone_number}</p>
                                        <p>Pricing: PHP ${restaurant.pricing_from}-${restaurant.pricing_to} per person</p>
                                    </div>
                                </div>
                                <br>
                            </div>
                        `;
                    });

                    $(".restaurantCategory").html(stackHtml);
                }
            }
        )
    })

    $("#search-reviews-form").submit(function (event) {
        event.preventDefault();

        let restaurantId = $("#search-reviews").data("restaurant-id");
        let searchContent = $(this).find("input[name='q']").val().trim();

        $.post("/ajax_response_reviews", { id: restaurantId, content: searchContent },
            function(data, status) {
                if (status == 'success') {
                    let reviewHtml = "";

                        data.forEach(review => {
                            reviewHtml += `
                                <div><hr></div>
                                <div class="review-container">
                                    <div class="reviewer-container">
                                        <img src="${review.user_id.picture_address}" alt="User Icon">
                                        <div class="reviewer-info">
                                            <div class="reviewer-name text-clickable" onclick="window.location.href='/users/${review.user_id._id}'">
                                                <b><span>${review.user_id.first_name} ${review.user_id.last_name}</span></b>
                                            </div>
                                            <div class="reviewer-date">
                                                <span>${review.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="review-content-container">
                                        <div class="review-content">
                                            <h1 class="text-clickable" onclick="window.location.href='/view_review/${review._id}'">${review.title}</h1>
                                            <div class="rating-container">
                                                <p class="rating rating-3" style="--rating:${review.rating};"></p>
                                            </div>
                                            <p class="review-content">${review.content}</p>
                                            ${review.has_images ? `
                                                <div class="review-image-container">
                                                    ${review.picture_addresses.map(img => `<img src="${img}" alt="Review Image">`).join("")}
                                                </div>` : ""}
                                        </div>
                                        <div class="buttons-space-2">
                                            <div class="like-container button-container-attributes">
                                                <button class="btn toggle-btn" id="like">
                                                    <img src="/common/empty-like.png" width="15px" height="15px">
                                                    <b>${review.likes}</b>
                                                </button>
                                                <div class="divider"></div>
                                                <button class="btn toggle-btn" id="dislike">
                                                    <img src="/common/empty-unlike.png" width="15px" height="15px">
                                                    <b>${review.dislikes}</b>
                                                </button>
                                            </div>
                                            <div class="comments-container button-container-attributes1 button-clickable gray-button-clickable" onclick="window.location.href='/view_review/${review._id}'">
                                                <img src="/common/comment-icon.png" alt="Comment Icon" class="icon-margin-right">
                                                <b>${review.num_comments} comments</b>
                                            </div>
                                        </div>
                                        ${review.has_owner_reply ? `
                                        <div class="reply-background">
                                            <div class="reply-container">
                                                <b><p>Reply from <span class="text-clickable" onclick="window.location.href='/${review.owner_username}'">${review.owner_name} (Owner)</span></p></b>
                                                <p>${review.owner_reply}</p>
                                            </div>
                                        </div>` : ""}
                                    </div>
                                </div>
                            `;
                        });
    
                    $(".review-thread-container").html(reviewHtml);
                }
            }
        )
    })

    $(".dropdown-option").click(function () {
        let selectedImg = $(this).find("img");
        let imgSrc = selectedImg.attr("src");
        let imgWidth = selectedImg.width();  // Get width
        let imgHeight = selectedImg.height(); // Get height
        let dropdown = $(this).closest(".dropdown");

        // Update button with selected image
        dropdown.find(".dropdown-btn").html(`<img src="${imgSrc}" width="${imgWidth}" height="${imgHeight}" style="border-radius: 10px;">`);
        
        // If the .edit-restaurant div exists, update its background image
        if ($(".edit-restaurant").length)
            $(".edit-restaurant").css("background-image", `linear-gradient(to bottom, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.88)), url('${imgSrc}')`);

        if ($("#picture_address").length) {
            $("#picture_address").val(imgSrc);
        }

        // Hide dropdown
        dropdown.find(".dropdown-content").removeClass("show");
    });

    $(".type-option").click(function () {
        let selectedType = $(this).text();
        $("#selected-type").html(`${selectedType} <img src="https://static.vecteezy.com/system/resources/previews/014/455/895/non_2x/down-arrow-icon-on-transparent-background-free-png.png" height="10vh" width="10vh">`);
        $("#food-type").val(selectedType);
    });

    // Hide dropdown when clicking outside
    $(document).click(function (event) {
        if (!$(event.target).closest(".dropdown").length) {
            $(".dropdown-content").removeClass("show");
        }
    });

    $(".next-btn").click(function () {
        $("#reg-page-1").hide();
        $("#reg-page-2").show();
    });

    $(".prev-btn").click(function () {
        $("#reg-page-2").hide();
        $("#reg-page-1").show();
    });

    $(".prof-nav-link").on("click", function () {
        $(".prof-nav-link").removeClass("active");
        $(this).addClass("active");

        let sectionToShow = $(this).data("section");
        $(".prof-section").hide();
        $("#" + sectionToShow).show();
    });

    // Form Validation
    function validatePriceInput(input1, input2) {
        let value1 = input1.val().trim();
        let value2 = input2.val().trim();
        let regex = /^\d+(\.\d{1,2})?$/;
    
        let num1 = parseFloat(value1);
        let num2 = parseFloat(value2);
    
        let isValid1 = regex.test(value1);
        let isValid2 = regex.test(value2);
    
        // Validate individual inputs
        if (!isValid1) {
            input1.css("border", "2px solid red");
            input1[0].setCustomValidity("Please enter a valid number (integer or up to 2 decimal places)");
        } else {
            input1.css("border", "");
            input1[0].setCustomValidity("");
        }
        
        if (!isValid2) {
            input2.css("border", "2px solid red");
            input2[0].setCustomValidity("Please enter a valid number (integer or up to 2 decimal places)");
        } else {
            input2.css("border", "");
            input2[0].setCustomValidity("");
        }
    
        // Validate price range
        if (isValid1 && isValid2 && num1 > num2) {
            input1.css("border", "2px solid red");
            input2.css("border", "2px solid red");
            input1[0].setCustomValidity("Please enter a valid price range");
            input2[0].setCustomValidity("Please enter a valid price range");
        } else if (isValid1 && isValid2) {
            input1.css("border", "");
            input2.css("border", "");
            input1[0].setCustomValidity("");
            input2[0].setCustomValidity("");
        }
    }
    
    // Validate on blur
    $("#input-min_price, #input-max_price").on("input blur", function () {
        let minPrice = $("#input-min_price");
        let maxPrice = $("#input-max_price");
    
        validatePriceInput(minPrice, maxPrice);
    });
    
    // Prevent form submission if validation fails
    $("#edit-restaurant-form").submit(function (event) {
        let minPrice = $("#input-min_price");
        let maxPrice = $("#input-max_price");
    
        validatePriceInput(minPrice, maxPrice);
    
        if (!minPrice[0].checkValidity() || !maxPrice[0].checkValidity()) {
            event.preventDefault(); 
        }
    });


    function validateForm(formSelector, fieldsToValidate) {
        $(formSelector).submit(function(event) {
            let isValid = true;
            
            // Check each required field
            $(fieldsToValidate).each(function() {
                let value = $(this).val().trim();
                
                if (value === "") {
                    $(this).css("border", "2px solid red");
                    isValid = false;
                } else {
                    $(this).css("border", "");
                }
            });
            
            // Check if passwords match (only for registration form)
            if (formSelector === "#register-form-step1" && $("#reg-pass").val() !== $("#reg-confpass").val()) {
                $("#reg-confpass").css("border", "2px solid red");
                isValid = false;
                // Add error message for password mismatch
                if (!$("#password-mismatch-error").length) {
                    $("#reg-confpass").after('<div id="password-mismatch-error" class="error-message">Passwords do not match</div>');
                }
            } else if (formSelector === "#register-form-step1") {
                $("#password-mismatch-error").remove();
            }
            
            // Prevent form submission if validation fails
            if (!isValid) {
                event.preventDefault();
                console.log("Form validation failed");
            }
        });
        
        // Real-time validation on input and blur
        $(fieldsToValidate).on("input blur", function() {
            let value = $(this).val().trim();
            
            if (value === "") {
                $(this).css("border", "2px solid red");
            } else {
                $(this).css("border", "");
                
                // Clear password mismatch error when typing in password fields
                if ($(this).attr('id') === 'reg-pass' || $(this).attr('id') === 'reg-confpass') {
                    if ($("#reg-pass").val() === $("#reg-confpass").val()) {
                        $("#password-mismatch-error").remove();
                    }
                }
            }
        });
    }
    
    // Call validateForm for the forms
    validateForm("#register-form-step1", "#reg-email, #reg-firstN, #reg-lastN, #reg-user, #reg-pass, #reg-confpass");
    validateForm("#login-form", "#log-email, #log-password");
});