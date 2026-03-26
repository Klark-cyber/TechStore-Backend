console.log("Signup frontend javascript file");

$(function() {
    const fileTarget = $(".file-box .upload-hidden");
    let filename;

    fileTarget.on("change", function(){ //fileTargetga tegishli biror change hosil bolganda quyidagi f-ya ishga tushadi
        if(window.FileReader){ //windoow obyectining FileReader State propertysi mavjud bolsa uni uploadfiilega yukladik
            const uploadFile = $(this)[0].files[0]; // yuklangan fileni qolga kiritdik 
            console.log("uploadFile:", uploadFile) //yuklangan filening typeni formtini aniqladik
;           const fileType = uploadFile["type"];
            const validImageType = ["image/jpg", "image/jpeg", "image/png"] //maqsad: user faqat biz belgilagan formatdagi fileni yuklasin
            
            if(!validImageType.includes(fileType)){
                alert("Please insert only jpeg, jpg, png!");
            }else {
                if(uploadFile){ //uploadFileni tekshiramiz
                    console.log(URL.createObjectURL(uploadFile)); // uploadFileni serverga yubborishdan oldin browser session xotirasiga vaqtincha joylab rasmni korishi test qilishi mumkin boladi
                    $(".upload-img-frame").attr("src",URL.createObjectURL(uploadFile)).addClass("succes") //defolt imageni ozgartiramiz. jquery yordamida defolt rasm joylashgan classni chaqirib attr yordamida srcni yuqoriga url ichiga joylangan uploadFileni joylab rasmni allmashtirdik. addclass methodi yordamida test uchun succes nomli klass qoshdik
                }
                filename = $(this)[0].files[0].name; //
                console.log(filename)
            }
            $(this).siblings(".upload-name").val(filename);
        }
    })
});


//validateSignupFormda user kiritgan malumotlar xto bolsa yoki toliq bolmasa uni serverga yuborishni oldini olish mantiqini yozdik.Fronted Validation
function validateSignupForm(){
    // console.log("Executed")
    // const memberNick = $(".member-nick").val();
    // console.log(memberNick)

    const memberNick = $(".member-nick").val();
    const memberPhone = $(".member-phone").val();
    const memberPassword = $(".member-password").val();
    const confirmPassword = $(".confirm-password").val();

    if(memberNick ==="" || 
        memberPhone ===""||
        memberPassword ===""||
        confirmPassword ===""
    ){
        alert("Please insert all required inputs")
        return false
    }

    if(memberPassword !== confirmPassword){
        alert("Password differs, please check!")
        return false;
    }
    
    const memberImage = $(".member-image").get(0).files[0] ? $(".member-image").get(0).files[0].name : null; // member-image klasidagi rasmnni qaytarsin aks holda null
    
    if(!memberImage){
        alert("Please insert restaurant Image!");
        return false
    }
    console.log("mavjud")
}