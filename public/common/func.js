$(document).ready(function () {
    $(".rating.unlocked").each(function () {
        let ratingValue = $(this).data("rating");
        $(this).css("--rating", ratingValue);
    });

    $(".rating.unlocked .star").on("click", function () {
        let ratingValue = $(this).data("value");
        let ratingElement = $(this).closest(".rating.unlocked");

        ratingElement.css("--rating", ratingValue);
        ratingElement.attr("data-rating", ratingValue);

        console.log("You selected: " + ratingValue + " stars ⭐");

        $.ajax({
            url: "/submit_rating",
            type: "POST",
            data: { rating: ratingValue },
            success: function (data, status) {
                if (status === "success") {
                    console.log("Rating saved successfully!");
                }
            },
            error: function () {
                console.error("Failed to save rating.");
            },
        });
    });

    $(".dropdown-btn").click(function (event) {
        event.stopPropagation(); // Prevents click from propagating
        $(this).siblings(".dropdown-content").toggleClass("show");
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