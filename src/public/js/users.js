console.log("Users frontend javascript file");
$(function(){
    $(".member-status").on("change", function(e){ //memberstatusda ozgarish hosil bolganda ishga tushadugan jmantiq
    const id = e.target.id
    console.log(id);

    const memberStatus = $(`#${id}.member-status`).val();
    console.log(memberStatus);

    $
    
    //ToDo Axios updateChosenUser
    axios.post("/admin/user/edit", {
        _id: id, 
        memberStatus: memberStatus,
    }).then((response) => {
        console.log("response:", response)
        const result = response.data;
        console.log("result:", result);

        if(result.data){
            console.log("User updateed!")
            $(".member-status").blur();
        }else {alert("User update failed!")}
    }).catch(err => {
        console.log(err);
        alert("User update failed!")
    })
    })
})

 function updateClock() {
    var now = new Date();
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');
    var el = document.getElementById('digital-clock');
    if (el) el.textContent = hours + ':' + minutes + ':' + seconds;
  }
  setInterval(updateClock, 1000);
  updateClock();