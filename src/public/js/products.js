console.log("Products frontend javascript file");

$(function(){
    $(".product-collection").on("change", () => {
        const selectedValue = $(".product-collection").val();
        if(selectedValue === "DRINK"){
            $("#product-volume").show(); //product-volumeni korsat
            $("#product-collection").hide(); //product-collection yashir
        }else{
             $("#product-collection").show(); //product-collectionni korsat
            $("#product-volume").hide(); //product-volumeni yashir            
        }
    });
// New product bosilganda nutton yoqolib product qoshish uchun oynani hosil qilish
    $("#process-btn").on("click", () => {
    $(".dish-container").slideToggle(500);
    $("#process-btn").css("display", "none")
});
//Cancelni bosganda New product button paydo bolib productni qoshish oynasi yopilsin
    $("#cancel-btn").on("click", () => {
    $(".dish-container").slideToggle(100);
    $("#process-btn").css("display", "flex")
});

$(".new-product-status").on("change", async function (e) {
    const id = e.target.id;
    const productStatus = $(`#${id}.new-product-status`).val();
    console.log("id:", id);
    console.log("productStatus:", productStatus);

    try {
        const response = await axios.post(`/admin/product/${id}`, {
            productStatus: productStatus,
        });
        
        console.log("response:", response);
        const result = response.data;
        
        if (result.data) {
            console.log("Product updated!");
            $(".new-product-status").blur();
        } else {
            alert("Product update failed!");
        }
    } catch (err) {
        console.log(err);
        alert("Product update failed!");
    }
});


});



function validateForm(){
    // console.log("Executed")
    // const memberNick = $(".member-nick").val();
    // console.log(memberNick)

    const productName = $(".product-name").val();
    const productPrice = $(".product-price").val();
    const productLeftCount = $(".product-left-count").val();
    const productCollection = $(".product-collection").val();
    const productDesc = $(".product-desc").val();
    const productStatus = $(".product-status").val();

    if(
        productName ==="" || 
        productPrice ===""||
        productLeftCount ===""||
        productCollection ===""||
        productDesc ===""||
        productStatus ===""
    ) {
        alert("Please insert all required details")
        return false
        
    }else return true;    
}

function previewFileHandler(input, order) {  //order yuklanayotgan rasmga tegishli joyning tartib raqami
    const imgClassName = input.className;
    console.log(input)
    console.log("imgClassName:", imgClassName);

    const file = $(`.${imgClassName}`).get(0).files[0];
    const fileType = file["type"];
    const validImageType = ["image/jpg", "image/jpeg", "image/png"]

     if(!validImageType.includes(fileType)){
                alert("Please insert only jpeg, jpg, png!");
            }else {
                if(file) {
                    const reader = new FileReader();
                    reader.onload = function(){
                        $(`#image-section-${order}`).attr("src", reader.result);
                    };
                    reader.readAsDataURL(file);
                }
            }
}