



// faqs
const faqQuestions = document.querySelectorAll('.faq-question');
    
faqQuestions.forEach((question) => {
    const arrow = question.querySelector('.faq-arrow');
    question.addEventListener('click', () => {
        question.nextElementSibling.classList.toggle('active');
        arrow.textContent = question.nextElementSibling.classList.contains('active') ? '▲' : '▶';
    });
});


function changeImagePD(imageUrl) {
  console.log({ imageUrl })
  console.log("salfjlasdjflasj")
  const mainImage = document.getElementById('mainImagePD');
  mainImage.src = "/uploads/" + imageUrl;
  const selectedThumbnail = document.querySelector(`img[src="${imageUrl}"]`);
  selectedThumbnail.style.border = '2px solid #007bff';
}




// handle ratings 
const stars = document.querySelectorAll('.stars');
const ratingInput = document.getElementById('ratingInput');

stars.forEach((star) => {
  star.addEventListener('click', (event) => {
    const selectedRating = event.target.getAttribute('data-rating');
    ratingInput.value = selectedRating;

    // Remove 'selected' class from all stars
    stars.forEach((otherStar) => otherStar.classList.remove('selected'));

    // Add 'selected' class to the clicked stars
    for (let i = 0; i < selectedRating; i++) {
      stars[i].classList.add('selected');
    }
  });
});



//code for login / signup buttons toggles starts
const loginBtn = document.getElementById("loginButton")
const signupButton = document.getElementById("signupButton")
const swithToSignup = document.getElementById("swithToSignup")
const swithToLogin = document.getElementById("swithToLogin")
const loginForm = document.getElementById("loginPopup")
const closeAll = document.querySelectorAll(".closeAll")
const signupPopup = document.getElementById("signupPopup")
loginBtn.addEventListener("click", () => {
  if (loginForm.style.display === "flex") {
    loginForm.style.display = "none";
  } else {
    loginForm.style.display = "flex";
  }
})
signupButton.addEventListener("click", () => {
  if (signupPopup.style.display === "flex") {
    signupPopup.style.display = "none";
  } else {
    signupPopup.style.display = "flex";
  }
})
swithToSignup.addEventListener("click", () => {
  if (signupPopup.style.display === "flex") {
    signupPopup.style.display = "none";
  } else {
    signupPopup.style.display = "flex";
  }
  if (loginForm.style.display === "flex") {
    loginForm.style.display = "none";
  } else {
    loginForm.style.display = "flex";
  }
})
swithToLogin.addEventListener("click", () => {
  signupPopup.style.display = "none";
  loginForm.style.display = "flex";
})

closeAll.forEach((button) => {
  button.addEventListener("click", () => {
    console.log({ button })
    signupPopup.style.display = "none";
    loginForm.style.display = "none";
  })
});
//code for login / signup buttons toggles ends





// script for interior design sidebar
function toggleSidebarDesigners() {
  const sidebar = document.getElementById('mySidebarDesigners');
  if (sidebar.style.width === '350px') {
    sidebar.style.width = '0';
  } else {
    sidebar.style.width = '350px';
  }
}




// propety page scripts starts
function toggleSidebarProperty() {
  const sidebar = document.getElementById('mySidebarProperty');
  if (sidebar.style.width === '350px') {
      sidebar.style.width = '0';
  } else {
      sidebar.style.width = '350px';
  }
}
function updatePriceValue() {
  const priceRange = document.getElementById('priceRange');
  const priceValue = document.getElementById('priceValue');
  priceValue.textContent = priceRange.value;
}
function updatePriceToValue() {
  const priceRange = document.getElementById('priceToRange');
  const priceValue = document.getElementById('priceToValue');
  priceValue.textContent = priceRange.value;
}

function toggleLabelColor(checkboxId) {
  const label = document.getElementById(checkboxId + 'Label');
  const checkbox = document.getElementById(checkboxId);

  if (checkbox.checked) {
      label.classList.add('selected-label');
  } else {
      label.classList.remove('selected-label');
  }
}
  // propety page scripts ends



  

 


  // popup code for update user modal
  // script.js

function openEditPopup() {
  document.getElementById("editPopup").style.display = "block";

}

function closeEditPopup() {
  document.getElementById("editPopup").style.display = "none";
}

function updateUser() {
  // Fetch the updated values
  var first_name = document.getElementById("firstNamee").value;
  var last_name = document.getElementById("lastNamee").value;
  var newEmail = document.getElementById("editEmail").value;
  var newPhone = document.getElementById("editPhone").value;
  var old_password = document.getElementById("old_password").value;
  var new_password = document.getElementById("new_password").value;

  // Assuming you have a route in your Node.js server to handle updates
  fetch('/updat_user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: newEmail,
      phone: newPhone,
      first_name : first_name,
      last_name : last_name,
      old_password,
      new_password,
    }),
  })
  .then(response => response.json())
  .then(data => {
    console.log({data})
    if(data.success){
      closeEditPopup(); 
      window.location.reload()
    }else{
      
      document.getElementById("msgError").innerHTML = data.error
    }
  })
  .catch((error) => {
    console.error('Error:', error);
  });
}
