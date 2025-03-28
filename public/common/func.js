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
        let selectedValue = $(this).data("value");
        let arrowGraphic = '\n<img src="https://static.vecteezy.com/system/resources/previews/014/455/895/non_2x/down-arrow-icon-on-transparent-background-free-png.png" height="10vh" width="10vh">'

        // Hide dropdown
        let dropdown = $(this).closest(".dropdown");
        dropdown.find(".dropdown-btn").html(selectedText+arrowGraphic);
        dropdown.find(".dropdown-content").removeClass("show"); 

        $.post('ajax_response', { option: selectedValue },
            function(data, status){
                if(status == 'success')
                    console.log("Option selected:", response);
            }
        )
    });

    $(".dropdown-option").click(function () {
        let selectedImg = $(this).find("img");
        let imgSrc = selectedImg.attr("src");
        let imgWidth = selectedImg.width();  // Get width
        let imgHeight = selectedImg.height(); // Get height
        let dropdown = $(this).closest(".dropdown");

        // Update button with selected image
        dropdown.find(".dropdown-btn").html(`<img src="${imgSrc}" width="${imgWidth}" height="${imgHeight}" style="border-radius: 10px;">`);

        // Hide dropdown
        dropdown.find(".dropdown-content").removeClass("show");
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
});