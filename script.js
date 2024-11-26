
  //Initial header value
  let final_tpTIN = "";
  let final_branchCode = "";
  let final_rdoCode = "";
  let final_entityType = "";
  let final_cycleType = "";
  let final_monthSelect = "";
  let final_companyName = "";
  let final_lastName = "";
  let final_firstName = "";
  let final_middleName = "";
  let final_tradeName = "";
  let final_subStreet = "";
  let final_street = "";
  let final_barangay = "" ;
  let final_cityMunicipality = "" ;
  let final_province = "";
  let final_zipCode = "";
  let userDriveID = "";
  let folderDriveID = "";

  // JavaScript Validation
  document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent default form submission

    //Close login modal
    //document.getElementById("loginModal").style.display = "none"; // Close the login modal

    // Show loading modal
    document.getElementById("loadingPopup").style.display = "block";  // Open loading modal

    // Get username and password values
    var username = document.getElementById('Username').value;
    var password = document.getElementById('Password').value;

    // Call Google Apps Script function to validate credentials
    google.script.run.withSuccessHandler(loginSuccess).validateCredentials(username, password);
  });

    document.getElementById('signupForm').addEventListener('submit', function(e) {
      e.preventDefault();

      document.getElementById("loadingPopup").style.display = "block";  // Open loading modal
      
      const username = document.getElementById('s_username').value;
      const email = document.getElementById('s_email').value;
      const password = document.getElementById('s_password').value;
      
      google.script.run
        .withSuccessHandler(function(response) {
          document.getElementById("loadingPopup").style.display = "none";  // close loading modal
          alert(response);
        })
        .sendVerificationEmail(username, email, password);
    });

function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";
}

// Handle login success
function loginSuccess(response) {
  if (response.success) {

    userDriveID = response.userDriveID;
    folderDriveID = response.folderDriveID;

    populateTINs();
    startLogoutTimer();
    startInactivityTimer();
    refreshData();
    google.script.run.createTimeDrivenTrigger();


    setTimeout(function() {
      //close modals
      document.getElementById("loadingPopup").style.display = "none"; // Close the loading modal
      document.getElementById("loginModal").style.display = "none"; // Close the modal
      document.getElementById("loginBtn").style.display = "none"; // Hide the login button
      document.getElementById("logoutBtn").style.display = "block"; // show the logout button
      // Show success pop-up
      document.getElementById("successPopup").style.display = "block";
    },1500);

    // Hide success pop-up after 1 seconds
    setTimeout(function() {
            document.getElementById("successPopup").style.display = "none";
            document.getElementById("tabMenu").style.display = "block"; // Hide the login button
            document.getElementById("DATGenie").style.display = "block";
            document.getElementsByClassName("tablinks")[0].click();
            document.getElementById("notifModal").style.display = "block";
      }, 2100);
      
    let isNavigatingAway = false;

    window.addEventListener('beforeunload', function (event) {
      if (!isNavigatingAway) {
        console.log(userDriveID);
        google.script.run.logout(userDriveID);
        event.preventDefault();
        event.returnValue = '';
      }
    });

    window.addEventListener('unload', function () {
      if (!isNavigatingAway) {
        console.log(userDriveID);
        google.script.run.logout(userDriveID);
      }
    });

    document.addEventListener('mousedown', function (event) {
      if (event.target.tagName === 'A' || event.target.tagName === 'BUTTON') {
        isNavigatingAway = true;
        // Reset the flag after a short delay
        setTimeout(function () {
          isNavigatingAway = false;
        }, 100);
      }
    });

  }else{
    if (response.error === 'invalidCredentials') {
      document.getElementById("loadingPopup").style.display = "none"; // close loading
      document.getElementById("loginModal").style.display = "block"; // show the login modal

      // Show error message
      document.getElementById("errorMessage").textContent = "Invalid username or password. Please try again.";
      document.getElementById("errorMessage").style.display = "block";

      // Add shaky animation to input fields
      document.getElementById("Username").classList.add("shaky");
      document.getElementById("Password").classList.add("shaky");
      document.getElementById("errorMessage").classList.add("shaky");

      // Remove shaky animation after 0.6s
      setTimeout(function() {
        document.getElementById("Username").classList.remove("shaky");
        document.getElementById("Password").classList.remove("shaky");
        document.getElementById("errorMessage").classList.remove("shaky");
      }, 600);

    } else if (response.error === 'activeUser'){
      document.getElementById("loadingPopup").style.display = "none"; // close loading
      document.getElementById("loginModal").style.display = "block"; // show the login modal

      // Show error message
      document.getElementById("errorMessage").textContent = "Error: There is already an active user.";
      document.getElementById("errorMessage").style.display = "block";

      // Add shaky animation to input fields
      document.getElementById("errorMessage").classList.add("shaky");

      // Remove shaky animation after 0.6s
      setTimeout(function() {
        document.getElementById("errorMessage").classList.remove("shaky");
      }, 600);
    }
  }
}

function sendHeartbeat() {
  google.script.run.sendHeartbeat();
}

// Send a heartbeat every 30 seconds
setInterval(sendHeartbeat, 30000);


function startLogoutTimer() {
  // Check every second if window is still open
  var timer = setInterval(function() {
    if (!window || window.closed) {
      clearInterval(timer);
      google.script.run.logout(userDriveID); // Call logout function if window is closed
    }
  }, 1000);
}

function startInactivityTimer() {
  // Check for user activity every second
  var timer = setInterval(function() {
    var currentTime = Date.now();
    if (currentTime - lastActivityTime > 1800000) { // 30 minutes (1800000 milliseconds)
      clearInterval(timer);
      alert("You've been inactive for 30 minutes. You've been logged out.");
      google.script.run.logout(userDriveID); // Logout if user is inactive for 10 minutes
      document.getElementById("tabMenu").style.display = "none"; // Hide the Tab Menues
      document.getElementById("DATGenie").style.display = "none";
    }
  }, 1000);

  // Track user activity
  document.addEventListener('mousemove', function() {
    lastActivityTime = Date.now();
  });

  document.addEventListener('keydown', function() {
    lastActivityTime = Date.now();
  });
}

function logout() {
  google.script.run.logout(userDriveID);
}

  //Rdo Code scripts
  var numbers = [ "001", "002", "003", "004", "005", "006", "007", "008", "009", "010", "011", "012", "013", "014", "015", "016", "17A", "17B", "018", "019", "020", "21A", "21B", "21C", "022", "23A", "23B", "024", "25A", "25B", "026", "027", "028", "029", "030", "031", "032", "033", "034", "035", "036", "037", "038", "039", "040", "041", "042", "043", "044", "045", "046", "047", "048", "049", "050", "051", "052", "53A", "53B", "54A", "54B", "055", "056", "057", "058", "059", "060", "061", "062", "063", "064", "065", "066", "067", "068", "069", "070", "071", "072", "073", "074", "075", "076", "077", "078", "079", "080", "081", "082", "083", "084", "085", "086", "087", "088", "089", "090", "091", "092", "93A", "93B", "094", "095", "096", "097", "098", "099", "100", "101", "102", "103", "104", "105", "106", "107", "108", "109", "110", "111", "112", "113", "114", "115"
  ];

  var datalist = document.getElementById("numbers");

  numbers.forEach(function(number) {
    var option = document.createElement("option");
    option.value = number;
    datalist.appendChild(option);
  });

  var inputBox = document.getElementById("rdoCode");
  inputBox.addEventListener("blur", function() {
    var valid = false;
    numbers.forEach(function(number) {
      if (inputBox.value === number) {
        valid = true;
      }
    });
    if (!valid) {
      inputBox.value = "";
      //alert("Please select a valid number from the list.");
    }
  });

function toggleDateSelection() {
var dateType = document.getElementById("cycleType").value;
var monthSelect = document.getElementById("monthSelect");
        
    if (dateType === "calendar") {
        monthSelect.disabled = true;
        monthSelect.value = "12"; // Set December as default
    } else {
        monthSelect.disabled = false;
        monthSelect.value = "01"; // Set January as default
        var decemberOption = monthSelect.querySelector('option[value="12"]');
        decemberOption.disabled = true;
    }
}


  // TP classification
function toggleClassSelection() {
  var tpClassification = document.getElementById("entityType").value;

    if (tpClassification === "Non-Individual"){
      document.getElementById("companyName").disabled=false
      document.getElementById("companyName").placeholder="ABC CORP"
      document.getElementById("lastName").disabled=true
      document.getElementById("firstName").disabled=true
      document.getElementById("middleName").disabled=true
      document.getElementById("lastName").value=""
      document.getElementById("firstName").value=""
      document.getElementById("middleName").value=""
      document.getElementById("lastName").placeholder=""
      document.getElementById("firstName").placeholder=""
      document.getElementById("middleName").placeholder=""
    }
    if (tpClassification === "Individual"){
      document.getElementById("companyName").disabled=true
      document.getElementById("companyName").placeholder=""
      document.getElementById("companyName").value=""
      document.getElementById("lastName").disabled=false
      document.getElementById("lastName").placeholder="DELA CRUZ"
      document.getElementById("firstName").disabled=false
      document.getElementById("firstName").placeholder="JUAN"
      document.getElementById("middleName").disabled=false
      document.getElementById("middleName").placeholder="TAMAD"
    }
}

//Alphanumeric only in inputbox
function validateInput(input) {

  // Replace consecutive double spaces with a single space
  input.value = input.value.replace(/\s{2,}/g, ' ');

  // Replace non-alphanumeric characters and single spaces with empty string
  input.value = input.value.replace(/[^a-zA-Z0-9\s]/g, '');

  //Capitalize
  input.value = input.value.toUpperCase();
}

//submit header forms
function submitForm() {
    
  var errorcounter = 0;

  var tpTIN = document.getElementById("tpTIN");
  var branchCode = document.getElementById('branchCode');
  var rdoCode =document.getElementById('rdoCode');
  var entityType = document.getElementById('entityType');
  var cycleType = document.getElementById('cycleType');
  var monthSelect = document.getElementById('monthSelect');
  var companyName = document.getElementById('companyName');
  var lastName = document.getElementById('lastName');
  var firstName = document.getElementById('firstName');
  var middleName = document.getElementById('middleName');
  var tradeName = document.getElementById('tradeName');
  var subStreet = document.getElementById('subStreet');
  var street = document.getElementById('street');
  var barangay = document.getElementById('barangay');
  var cityMunicipality = document.getElementById('cityMunicipality');
  var province = document.getElementById('province');
  var zipCode = document.getElementById('zipCode');

    //login and add shaky effect

    //TIN
    if(tpTIN.value === "" || tpTIN.value.length<9){
      var errorcounter = errorcounter + 1;
      tpTIN.classList.add("shaky");
      tpTIN.style.borderColor = 'red';
      setTimeout(function() {
        tpTIN.classList.remove("shaky");
        }, 300);
    } else{tpTIN.style.borderColor = '#ccc'; }

    //brach code
    if(branchCode.value === "" || branchCode.value.length<4){
      var errorcounter = errorcounter + 1;
      branchCode.classList.add("shaky");
      branchCode.style.borderColor = 'red';
      setTimeout(function() {
        branchCode.classList.remove("shaky");
        }, 300);
    } else{branchCode.style.borderColor = '#ccc';}

    //rdo code
    if(rdoCode.value === ""){
      var errorcounter = errorcounter + 1;
      rdoCode.classList.add("shaky");
      rdoCode.style.borderColor = 'red';
      setTimeout(function() {
        rdoCode.classList.remove("shaky");
        }, 300);
    } else{rdoCode.style.borderColor = '#ccc';}

    //Non-Individual
    if(entityType.value === "Non-Individual" && companyName.value.trim() === ""){
      var errorcounter = errorcounter + 1;
      companyName.classList.add("shaky");
      companyName.style.borderColor = 'red';
      setTimeout(function() {
        companyName.classList.remove("shaky");
        }, 300);
    } else{
      lastName.style.borderColor = '#ccc';
      firstName.style.borderColor = '#ccc';
      middleName.style.borderColor = '#ccc';
      companyName.style.borderColor = '#ccc';
    }

    //Individual
    if(entityType.value === "Individual"){

      //Last Name
      if(lastName.value.trim() ===""){
        var errorcounter = errorcounter + 1;
        lastName.classList.add("shaky");
        lastName.style.borderColor = 'red';
        setTimeout(function() {
          lastName.classList.remove("shaky");
          }, 300);
      } else{lastName.style.borderColor = '#ccc';}

      //First Name
      if(firstName.value.trim() ===""){
        var errorcounter = errorcounter + 1;
        firstName.classList.add("shaky");
        firstName.style.borderColor = 'red';
        setTimeout(function() {
          firstName.classList.remove("shaky");
          }, 300);
      } else{firstName.style.borderColor = '#ccc';}

      //Middle Name
      if(middleName.value.trim() === ""){
        var errorcounter = errorcounter + 1;
        middleName.classList.add("shaky");
        middleName.style.borderColor = 'red';
        setTimeout(function() {
          middleName.classList.remove("shaky");
          }, 300);
      } else{middleName.style.borderColor = '#ccc';}

    }

    //Trade name
    if(tradeName.value.trim() === ""){
      var errorcounter = errorcounter + 1;
      tradeName.classList.add("shaky");
      tradeName.style.borderColor = 'red';
      setTimeout(function() {
        tradeName.classList.remove("shaky");
        }, 300);
    } else{tradeName.style.borderColor = '#ccc';}    

    //Street
    if(street.value === ""){
      var errorcounter = errorcounter + 1;
      street.classList.add("shaky");
      street.style.borderColor = 'red';
      setTimeout(function() {
        street.classList.remove("shaky");
        }, 300);
    } else{street.style.borderColor = '#ccc';}

    //Barangay
    if(barangay.value === ""){
      var errorcounter = errorcounter + 1;
      barangay.classList.add("shaky");
      barangay.style.borderColor = 'red';
      setTimeout(function() {
        barangay.classList.remove("shaky");
        }, 300);
    } else{barangay.style.borderColor = '#ccc';}

    //City and Municipality
    if(cityMunicipality.value === ""){
      var errorcounter = errorcounter + 1;
      cityMunicipality.classList.add("shaky");
      cityMunicipality.style.borderColor = 'red';
      setTimeout(function() {
        cityMunicipality.classList.remove("shaky");
        }, 300);
    } else{cityMunicipality.style.borderColor = '#ccc';}

    //Province
    if(province.value === ""){
      var errorcounter = errorcounter + 1;
      province.classList.add("shaky");
      province.style.borderColor = 'red';
      setTimeout(function() {
        province.classList.remove("shaky");
        }, 300);
    } else{province.style.borderColor = '#ccc';}

    //Zip Code
    if(zipCode.value === "" || zipCode.value.length <4){
      var errorcounter = errorcounter + 1;
      zipCode.classList.add("shaky");
      zipCode.style.borderColor = 'red';
      setTimeout(function() {
        zipCode.classList.remove("shaky");
        }, 300);
    } else{zipCode.style.borderColor = '#ccc';}


    // sucessfull submission
    if(errorcounter===0){
    
    var tpMenu = document.getElementById('tpMenu');
    document.getElementById("loadingPopup").style.display = "block";

    //setTimeout(function(){
    //document.getElementById("loadingPopup").style.display = "none";
    //}, 2000);

    var formData = {
    tpTIN: tpTIN.value,
    branchCode: branchCode.value,
    rdoCode: rdoCode.value,
    entityType: entityType.value,
    cycleType: cycleType.value,
    monthSelect: monthSelect.value,
    companyName: companyName.value.trim(),
    lastName: lastName.value.trim(),
    firstName: firstName.value.trim(),
    middleName: middleName.value.trim(),
    tradeName: tradeName.value.trim(),
    subStreet: subStreet.value.trim(),
    street: street.value.trim(),
    barangay: barangay.value.trim(),
    cityMunicipality: cityMunicipality.value.trim(),
    province: province.value.trim(),
    zipCode: zipCode.value
    };
    //google.script.run.submitForm(tpTIN);
    google.script.run.withSuccessHandler(updateSelectOptions).submitForm(formData, userDriveID);

    //Initial header value
    final_tpTIN = document.getElementById('tpTIN').value
    final_branchCode = document.getElementById('branchCode').value
    final_rdoCode = document.getElementById('rdoCode').value
    final_entityType = document.getElementById('entityType').value
    final_cycleType = document.getElementById('cycleType').value
    final_monthSelect = document.getElementById('monthSelect').value
    final_companyName = document.getElementById('companyName').value
    final_lastName = document.getElementById('lastName').value
    final_firstName = document.getElementById('firstName').value
    final_middleName = document.getElementById('middleName').value
    final_tradeName = document.getElementById('tradeName').value
    final_subStreet = document.getElementById('subStreet').value
    final_street = document.getElementById('street').value
    final_barangay = document.getElementById('barangay').value
    final_cityMunicipality = document.getElementById('cityMunicipality').value
    final_province = document.getElementById('province').value
    final_zipCode = document.getElementById('zipCode').value

    tpMenu.textContent = final_tradeName

    }
}

function updateSelectOptions(){
    // Reload the select options after updating the database
    google.script.run.withSuccessHandler(function(tins) {
        var currentTIN = document.getElementById("tpTIN").value;
        var select = document.getElementById('loadTIN');
        select.innerHTML = ''; // Clear existing options

        var defaultOption = document.createElement('option');
        defaultOption.text = 'Select TIN';
        defaultOption.value = '';
        defaultOption.disabled = true;  // Make the default option disabled
        defaultOption.selected = true;  // Set it as the initial selected option
        select.appendChild(defaultOption);
        //alert(tins);

        tins.forEach(function(tinInfo) {
            var option = document.createElement('option');
            option.text = tinInfo.tin;  // Use tinInfo.tin for display text
            option.value = tinInfo.tin; // Use tinInfo.tin as the value
            option.title = tinInfo.tradeName; // Show tradeName on hover
            select.appendChild(option);
        });
        select.value = currentTIN;
    }).getTINs(userDriveID);

  document.getElementById("loadingPopup").style.display = "none";
}

function updateForm() {
  var selectedTIN = document.getElementById('loadTIN').value;
  google.script.run.withSuccessHandler(updateFormFields).getDataForTIN(selectedTIN, userDriveID);
  document.getElementById("loadingPopup").style.display = "block";
}

function updateFormFields(data) {

  //declared input header value
  document.getElementById('tpTIN').value = data.tpTIN || ''; 
  document.getElementById('branchCode').value = data.branchCode || '';
  document.getElementById('rdoCode').value = data.rdoCode || '';
  document.getElementById('entityType').value = data.entityType || '';
  document.getElementById('cycleType').value = data.cycleType || '';
  document.getElementById('monthSelect').value = data.monthSelect || '';
  document.getElementById('companyName').value = data.companyName || '';
  document.getElementById('lastName').value = data.lastName || '';
  document.getElementById('firstName').value = data.firstName || '';
  document.getElementById('middleName').value = data.middleName || '';
  document.getElementById('tradeName').value = data.tradeName || '';
  document.getElementById('subStreet').value = data.subStreet || '';
  document.getElementById('street').value = data.street || '';
  document.getElementById('barangay').value = data.barangay || '';
  document.getElementById('cityMunicipality').value = data.cityMunicipality || '';
  document.getElementById('province').value = data.province || '';
  document.getElementById('zipCode').value = data.zipCode || '';

    //Initial header value
  //final_tpTIN = document.getElementById('tpTIN').value
  //final_branchCode = document.getElementById('branchCode').value
  //final_rdoCode = document.getElementById('rdoCode').value
  //final_entityType = document.getElementById('entityType').value
  //final_cycleType = document.getElementById('cycleType').value
  //final_monthSelect = document.getElementById('monthSelect').value
  //final_companyName = document.getElementById('companyName').value
  //final_lastName = document.getElementById('lastName').value
  //final_firstName = document.getElementById('firstName').value
  //final_middleName = document.getElementById('middleName').value
  //final_tradeName = document.getElementById('tradeName').value
  //final_subStreet = document.getElementById('subStreet').value
  //final_street = document.getElementById('street').value
  //final_barangay = document.getElementById('barangay').value
  //final_cityMunicipality = document.getElementById('cityMunicipality').value
  //final_province = document.getElementById('province').value
  //final_zipCode = document.getElementById('zipCode').value

  // update header data
  submitForm();

  // close loading pop-up
  setTimeout(function(){
  document.getElementById("loadingPopup").style.display = "none";
  }, 1000);

}

function populateTINs() {
  google.script.run.withSuccessHandler(function(tins) {
    var select = document.getElementById('loadTIN');
    
    select.innerHTML = ''; // Clear existing options

    // Add the default "Select TIN" option back
    var defaultOption = document.createElement('option');
    defaultOption.text = 'Select TIN';
    defaultOption.value = '';
    defaultOption.disabled = true;  // Make the default option disabled
    defaultOption.selected = true;  // Set it as the initial selected option
    select.appendChild(defaultOption);

    // Populate the select element with TIN options
    tins.forEach(function(tinInfo) {
      var option = document.createElement('option');
      option.value = tinInfo.tin;        // Use tinInfo.tin for the option value
      option.textContent = tinInfo.tin;  // Display the TIN in the dropdown
      option.title = tinInfo.tradeName;  // Show tradeName when hovered over
      select.appendChild(option);
    });
  }).getTINs(userDriveID);
}

  var select = document.getElementById("reportingYear");
  var currentYear = new Date().getFullYear();
  for (var year = 2000; year <= 2100; year++) {
    var option = document.createElement("option");
    option.text = year;
    option.value = year;
    if (year === currentYear) {
      option.selected = true;
    }
    select.appendChild(option);
}

function checkFileType() {
  //var fileInput = document.getElementById('fileUpload');
  var fileInput = document.getElementsByName('fileUpload');
  var filePath = fileInput.value;
  if (!filePath.endsWith('.xlsx')) {
  alert('Please select a file with .xlsx extension.');
   fileInput.value = ''; // Clear the file input field
  }
}

function showRadioOptions() {
  // Get the selected value from the dropdown
  const reportingType = document.getElementById('reportingType').value;
  const reportingMonth = document.getElementById('reportingMonth');
            
  // Get the div containing radio buttons
  const sawtOptions = document.getElementById('sawtOptions');

  // Show the radio buttons if "SAWT" is selected, otherwise hide them
  if (reportingType === 'sawt') {
    sawtOptions.style.display = 'block';
  } else {
    sawtOptions.style.display = 'none';
  }

  if (reportingType === "1604C" || reportingType === "1604E") {
      reportingMonth.disabled = true;
      reportingMonth.value = "12"; // Set December as default
  } else {
      reportingMonth.disabled = false;
      //reportingMonth.value = "01"; // Set January as default
      //var decemberOption = reportingMonth.querySelector('option[value="12"]');
      //decemberOption.disabled = true;
  }

}

function getSelectedSAWT() {

  const reportingType = document.getElementById('reportingType').value;
  // Get all radio buttons with name 'sawtRadio'
  const sawts = document.getElementsByName('sawtRadio');

  let selectedSAWT;

  // Iterate over the radio buttons to find the checked one
  for (const sawt of sawts) {
    if (sawt.checked) {
      selectedSAWT = sawt.value;
      break;
    }
  }

  return selectedSAWT;
}

function uploadFile() {
  var loadTIN = document.getElementById('loadTIN').value;
  var reportingType = document.getElementById('reportingType').value;
  const fileInput = document.getElementById('fileUpload');
  const file = fileInput.files[0];
  const selectedSAWT = getSelectedSAWT();

  if (reportingType === 'sawt'){
    var reportingType = 'sawt_' + selectedSAWT;
  }

  if (!file) {
    alert('Please select an Excel file.');
    return;
  }

  if (loadTIN === '') {
    alert('Please update taxpayer details.');
    return; // Stop further processing
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const data = new Uint8Array(e.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const secondSheetName = workbook.SheetNames[1];
    const worksheet = workbook.Sheets[firstSheetName];
    const worksheet2 = workbook.Sheets[secondSheetName];
    const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    const json2 = XLSX.utils.sheet_to_json(worksheet2, { header: 1 });
    var header = json[0];
    var header2 = json2[0];

    if (reportingType === 'vat_sales' && firstSheetName === 'vat_sales') {
      processVatSales(json, header);
    } else if (reportingType === 'vat_purchases' && firstSheetName === 'vat_purchases') {
      processVatPurchases(json, header);
    } else if (reportingType === '1601EQ' && firstSheetName === '1601EQ_sched1' && secondSheetName === '1601EQ_sched2') {
      processQAP_E(json, header, json2, header2);
    } else if (reportingType === '1601FQ_sched1' && firstSheetName === '1601FQ_sched1') {
      processQAPF1(json, header);
    } else if (reportingType === 'sawt_' + selectedSAWT && firstSheetName === 'sawt_' + selectedSAWT) {
      processSAWT(json, header, selectedSAWT);
    } else if (reportingType === '1604C' && firstSheetName === '1604C_sched1' && secondSheetName === '1604C_sched2') {
      process1604C(json, header, json2, header2);
    } else if (reportingType === '1604E' && firstSheetName === '1604E_sched3' && secondSheetName === '1604E_sched4') {
      process1604E(json, header, json2, header2);
    } else {
      alert('The first sheet name of the Excel file is not "' + reportingType + '".');
    }
    
  };
  reader.readAsArrayBuffer(file);
}

//------------------------------------------------------Sales Script--------------------------------------------------//
function processVatSales(json, header) {

  var blankCells = findBlankCellsAndCheckCharacterLimits_S(json);
  if (blankCells.length > 0) {
    alert('Blank cells or character limit violations found in rows: ' + blankCells.join(', '));
    return;
  }


  var sortedData = json.slice(1).sort((a, b) => {
  if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
      return 0;
  });
  var sortedJson = [header].concat(sortedData);

  var result = convertToDATFormat_S(sortedJson);
  var datContent = result.datContent;
  var datfile_fileName = result.datfile_fileName;
  var total = calculateTotal_S(sortedJson);
  showPreview_S(datContent, total, datfile_fileName);
}

function convertToDATFormat_S(data) {

  // Get the header and reporting date details
  var reportingMonth = document.getElementById('reportingMonth').value;
  var reportingYear = document.getElementById('reportingYear').value;

  var newDate = new Date(reportingYear, reportingMonth, 0);
  var lastDay = newDate.getDate();
  var reportingDate = reportingMonth + "/" + lastDay + "/" + reportingYear


  // Replace blank cells in columns 8 to 11 with zeros
  for (let i = 0; i < data.length; i++) {
    for (let j = 7; j < 11; j++) {
      if (!data[i][j]) {
      data[i][j] = 0;
      }
    }
  }

  //DAT file header
  datfile_type = "S" //stands for Sales
  datfile_tpTIN = final_tpTIN === "" ? final_tpTIN : '"' + final_tpTIN + '"';
  datfile_companyName = final_companyName === "" ? final_companyName : '"' + final_companyName + '"';
  datfile_lastName = final_lastName === "" ? final_lastName : '"' + final_lastName + '"';
  datfile_firstName = final_firstName === "" ? final_firstName : '"' + final_firstName + '"';
  datfile_middleName = final_middleName === "" ? final_middleName : '"' + final_middleName + '"';
  dafile_tradeName = final_tradeName === "" ? final_tradeName : '"' + final_tradeName + '"';
  datfile_address1 = `"${final_subStreet ? final_subStreet + ' ' : ''}${final_street} ${final_barangay}"`;
  datfile_address2 = `"${final_cityMunicipality} ${final_province} ${final_zipCode}"`;

  //DAT filename
  datfile_fileName = final_tpTIN + datfile_type + reportingMonth + reportingYear + ".DAT";

  // Define the header rows
  const firstRow = [
  "H", 
  datfile_type, 
  datfile_tpTIN,
  datfile_companyName,
  datfile_lastName,
  datfile_firstName,
  datfile_middleName,
  dafile_tradeName,
  datfile_address1,
  datfile_address2
  ];

  // Calculate sum of 8th to 11th columns
  const total = calculateTotal_S(data);

  // Append totals to the first row
  for (let i = 0; i < total.length; i++) {
    firstRow.push(total[i].toFixed(2)); // Round the total to 2 decimal places and convert to string
  }

  // Append additional header
  firstRow.push(final_rdoCode, reportingDate, final_monthSelect);

  const content = [firstRow.join(',')]; // Join with commas
            
  const datContent =  content.concat(data.slice(1) // Exclude the first row (header)
    .map(row => {
      return row.map((cell, index) => {
      if (typeof cell === 'string') {

      // Convert to uppercase
      cell = cell.toUpperCase();

      // Remove special characters, replace "&" with "AND", and replace "Ñ" with "N"
      cell = String(cell).replace(/\s\s+/g, ' ').replace(/&/g, "AND").replace(/Ñ/g, "N").replace(/[^\w\s]|_/g, "");

      // Remove leading and trailing spaces
      cell = cell.trim();

      // Replace linebreak character with space character
      cell = String(cell).replace(/\r?\n|\r/g, ' ');
      }
    
      // Remove spaces and special characters, then trim to 9 characters in excel TIN column
      if (index === 0) {
      cell = String(cell).replace(/\W/g, '').substring(0, 9);
      }
    
      // Ensure number values in 8th to 11th columns have 2 decimal places
      if (index >= 7 && index <= 10) {
        if (!isNaN(cell) && parseFloat(cell) !== 0) {
          return parseFloat(Math.round(cell * 100) / 100).toFixed(2); // Round and ensure 2 decimal places
        } else {
        return "0"; // Ensure zero is displayed as "0"
        }
      }

      // Round numeric values to 2 decimal places for other columns, ensuring they are not zero
      if (!isNaN(cell) && typeof cell === 'number') {
        return parseFloat(Math.round(cell * 100) / 100).toFixed(2);
      }

    return cell;
    });
  })

  .map(row => {
    row.unshift("D", datfile_type); // Add "D" and transaction type to the beginning of each row
    row.push(final_tpTIN, reportingDate); // Append TP TIN and Reporting date and end of each row
    return row.map((cell, index) => {

    // Add quotes to the 3rd to 8th columns
    if (index >= 2 && index <= 8) {
      return '"' + cell + '"';
    }
    return cell;
    }).join(',');

  })).join('\n');

  return { datContent, datfile_fileName};
}

function calculateTotal_S(data) {
  let total = [0, 0, 0, 0]; // Initialize totals for columns 8 to 11

  data.slice(1).forEach(row => {
    for (let colNum = 7; colNum <= 10; colNum++) { // Columns 8 to 11
    let cell = row[colNum];
      if (!isNaN(cell)) {
        total[colNum - 7] += parseFloat(cell); // Add cell value to total
      }
    }
  });
  return total;
}

function findBlankCellsAndCheckCharacterLimits_S(data) {
  const invalidRows = [];
  for (let i = 1; i < data.length; i++) { // Skip header row
    if (!data[i][1] || !data[i][5] || !data[i][6]) { // Columns 2, 6, and 7 (0-based index)
      invalidRows.push(i + 1); // Add 1 to convert 0-based index to 1-based row number
    }
    if (data[i][1] && data[i][1].length > 50) { // Column 2
      invalidRows.push(i + 1);
    }
    for (let colNum = 2; colNum <= 6; colNum++) { // Columns 3 to 7
      if (data[i][colNum] && data[i][colNum].length > 30) {
        invalidRows.push(i + 1);
      }
    }
  }
  return invalidRows;
}

function showPreview_S(datContent, total, datfile_fileName) {
  const previewModal = document.getElementById('previewModal');
  const existingFileModal = document.getElementById('existingFileModal');
  const existingFilemessage = document.getElementById('existingFilemessage');
  const previewData = document.getElementById('dataPreview');
  const downloadButton = document.getElementById('downloadButton');
  const yesButton = document.getElementById('yesButton');
  const previewFileName = document.getElementById('previewFileName');
  const previewTotal = document.getElementById('totalPreview');
  const reportingYear = document.getElementById('reportingYear').value;
  const reportingMonth = document.getElementById('reportingMonth').value;
  const transactionType = "Sales"

  //drive path 
  const folderPath = 'DATFiles/' + final_tpTIN + '/' + transactionType + '/' + reportingYear;

  // Get the last day of the reporting month
  const newDate = new Date(reportingYear, reportingMonth, 0);
  const lastDay = newDate.getDate();
  const reportingDate = reportingMonth + "/" + lastDay + "/" + reportingYear

  // Prepare totals display
  const totalsDisplay = 
`Total Exempt: ${total[0].toFixed(2)}
Total Zero-Rated: ${total[1].toFixed(2)}
Total Vatable: ${total[2].toFixed(2)}
Total Output VAT: ${total[3].toFixed(2)}`;

  // Prepare existing file display
  const existingMessage = 'Existing File Found!' + "\n\n" + 'File Name: ' + datfile_fileName + '\n' + 'Transaction Type: ' + transactionType + '\n' + 'Reporting Period: '  + reportingDate + '\n\n\n' + 'Overwrite this file?';

  //Show loding pop-up
  document.getElementById("loadingPopup").style.display = "block"

  //save to Gdrive
  google.script.run.withSuccessHandler(function(response) {
    if(response === true){
      document.getElementById("loadingPopup").style.display = "none"
      existingFileModal.style.display = 'block';
      existingFilemessage.textContent = existingMessage;

      //add shaky effect
      document.getElementById('existingFileModal2').classList.add("shaky");

      yesButton.onclick = function() {
        document.getElementById("loadingPopup").style.display = "block"
        google.script.run.deleteFileToDrive(datfile_fileName, folderPath, userDriveID, folderDriveID);
        setTimeout(function(){
        previewFileName.textContent = datfile_fileName;
        previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
        previewData.textContent = datContent; // Display the final DAT content
        existingFileModal.style.display = 'none'; // close exitingfile modal
        previewModal.style.display = 'block'; // Show the preview modal
        downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
        google.script.run.uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
        refreshData();
        document.getElementById("loadingPopup").style.display = "none";
        },3000);
      };
      return //cancel futher processing
    }else{
      document.getElementById("loadingPopup").style.display = "none"
      previewFileName.textContent = datfile_fileName;
      previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
      previewData.textContent = datContent; // Display the final DAT content
      previewModal.style.display = 'block'; // Show the modal
      downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
    }
  }).uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
  setTimeout(function(){
    refreshData();
  },1000);
}

//------------------------------------------------------Purchases Script--------------------------------------------------//
function processVatPurchases(json, header) {

  var blankCells = findBlankCellsAndCheckCharacterLimits_P(json);
  if (blankCells.length > 0) {
    alert('Blank cells or character limit violations found in rows: ' + blankCells.join(', '));
    return;
  }

  var sortedData = json.slice(1).sort((a, b) => {
    if (a[1] < b[1]) return -1;
      if (a[1] > b[1]) return 1;
        return 0;
  });
  var sortedJson = [header].concat(sortedData);

  document.getElementById("noncreditablemodal").style.display = "block";

  var noncreditableInputTax = document.getElementById("noncreditableInputTax").value;

  //var datContent = convertToDATFormat_P(sortedJson, noncreditableInputTax);
  var total = calculateTotal_P(sortedJson);
  document.getElementById("creditableInputTax").value = total[5].toFixed(2);
  updateInputTaxTotal();

  document.getElementById("inputTaxbutton").onclick = function() {
  try {
    var noncreditableInputTax = document.getElementById("noncreditableInputTax").value;
    var result = convertToDATFormat_P(sortedJson, noncreditableInputTax);
    var datContent = result.datContent;
    var datfile_fileName = result.datfile_fileName;
    var total = calculateTotal_P(sortedJson);
    showPreview_P(datContent, total, noncreditableInputTax, datfile_fileName);
    document.getElementById("noncreditablemodal").style.display = "none";
    document.getElementById("noncreditableInputTax").value = '';
    } catch (error) {
    console.error('Error processing files:', error);
    alert('Error processing files: ' + error);
    }
  };
}

function convertToDATFormat_P(data, noncreditableInputTax) {

  // Get the header and reporting date details
  var reportingMonth = document.getElementById('reportingMonth').value;
  var reportingYear = document.getElementById('reportingYear').value;

  var newDate = new Date(reportingYear, reportingMonth, 0);
  var lastDay = newDate.getDate();
  var reportingDate = reportingMonth + "/" + lastDay + "/" + reportingYear


  // Replace blank cells in columns 8 to 11 with zeros
  for (let i = 0; i < data.length; i++) {
    for (let j = 7; j < 13; j++) {
      if (!data[i][j]) {
      data[i][j] = 0;
      }
    }
  }

  //DAT file header
  datfile_type = "P" //stands for Purchases
  datfile_tpTIN = final_tpTIN === "" ? final_tpTIN : '"' + final_tpTIN + '"';
  datfile_companyName = final_companyName === "" ? final_companyName : '"' + final_companyName + '"';
  datfile_lastName = final_lastName === "" ? final_lastName : '"' + final_lastName + '"';
  datfile_firstName = final_firstName === "" ? final_firstName : '"' + final_firstName + '"';
  datfile_middleName = final_middleName === "" ? final_middleName : '"' + final_middleName + '"';
  dafile_tradeName = final_tradeName === "" ? final_tradeName : '"' + final_tradeName + '"';
  datfile_address1 = `"${final_subStreet ? final_subStreet + ' ' : ''}${final_street} ${final_barangay}"`;
  datfile_address2 = `"${final_cityMunicipality} ${final_province} ${final_zipCode}"`;

  //DAT filename
  datfile_fileName = final_tpTIN + datfile_type + reportingMonth + reportingYear + ".DAT";

  // Define the header rows
  const firstRow = [
  "H", 
  datfile_type, 
  datfile_tpTIN,
  datfile_companyName,
  datfile_lastName,
  datfile_firstName,
  datfile_middleName,
  dafile_tradeName,
  datfile_address1,
  datfile_address2
  ];

  // Calculate sum of 8th to 11th columns
  const total = calculateTotal_P(data);

  if (noncreditableInputTax === ""){
    var noncreditableInputTax = "0"
  }

  var totalInputTax = total[5] - parseFloat(noncreditableInputTax);

  // Append totals to the first row
  for (let i = 0; i < total.length; i++) {
    firstRow.push(total[i].toFixed(2)); // Round the total to 2 decimal places and convert to string
  }

  //Append total creditable input tax and total input tax
  firstRow.push(totalInputTax.toFixed(2), parseFloat(noncreditableInputTax).toFixed(2));

  // Append additional header
  firstRow.push(final_rdoCode, reportingDate, final_monthSelect);

  const content = [firstRow.join(',')]; // Join with commas
            
  const datContent = content.concat(data.slice(1) // Exclude the first row (header)
    .map(row => {
      return row.map((cell, index) => {
      if (typeof cell === 'string') {

      // Convert to uppercase
      cell = String(cell).toUpperCase();

      // Remove special characters, replace "&" with "AND", and replace "Ñ" with "N"
      cell = String(cell).replace(/\s\s+/g, ' ').replace(/&/g, "AND").replace(/Ñ/g, "N").replace(/[^\w\s]|_/g, "");

      // Remove leading and trailing spaces
      cell = String(cell).trim();

      // Replace linebreak character with space character
      cell = String(cell).replace(/\r?\n|\r/g, ' ');
      }
    
      // Remove spaces and special characters, then trim to 9 characters in excel TIN column
      if (index === 0) {
      cell = String(cell).replace(/\W/g, '').substring(0, 9);
      }

      // Ensure number values in 8th to 13th columns have 2 decimal places
      if (index >= 7 && index <= 12) {
        if (!isNaN(cell) && parseFloat(cell) !== 0) {
          return parseFloat(Math.round(cell * 100) / 100).toFixed(2); // Round and ensure 2 decimal places
        } else {
        return "0"; // Ensure zero is displayed as "0"
        }
      }

      // Round numeric values to 2 decimal places for other columns, ensuring they are not zero
      if (!isNaN(cell) && typeof cell === 'number') {
        return parseFloat(Math.round(cell * 100) / 100).toFixed(2);
      }
    

    return cell;
    });
  })

  .map(row => {
    row.unshift("D", datfile_type); // Add "D" and transaction type to the beginning of each row
    row.push(final_tpTIN, reportingDate); // Append TP TIN and Reporting date and end of each row
    return row.map((cell, index) => {

    // Add quotes to the 3rd to 8th columns
    if (index >= 2 && index <= 8) {
      return '"' + cell + '"';
    }
    return cell;
    }).join(',');

  })).join('\n');

  return { datContent, datfile_fileName};
}

function calculateTotal_P(data) {
  let total = [0, 0, 0, 0, 0, 0]; // Initialize totals for columns 8 to 13

  data.slice(1).forEach(row => {
    for (let colNum = 7; colNum <= 12; colNum++) { // Columns 8 to 13
    let cell = row[colNum];
      if (!isNaN(cell)) {
        total[colNum - 7] += parseFloat(cell); // Add cell value to total
      }
    }
  });
  return total;
}

function findBlankCellsAndCheckCharacterLimits_P(data) {
  const invalidRows = [];
  for (let i = 1; i < data.length; i++) { // Skip header row
    if (!data[i][1] || !data[i][5] || !data[i][6]) { // Columns 2, 6, and 7 (0-based index)
      invalidRows.push(i + 1); // Add 1 to convert 0-based index to 1-based row number
    }
    if (data[i][1] && data[i][1].length > 50) { // Column 2
      invalidRows.push(i + 1);
    }
    for (let colNum = 2; colNum <= 6; colNum++) { // Columns 3 to 7
      if (data[i][colNum] && data[i][colNum].length > 30) {
        invalidRows.push(i + 1);
      }
    }

    for (let colNum = 7; colNum <= 11; colNum++) {
      if (data[i][colNum] === "" || data[i][colNum] === null) {
        data[i][colNum] = "0";
      }
    }
  }
  return invalidRows;
}

function showPreview_P(datContent, total, noncreditableInputTax, datfile_fileName) {
  const previewModal = document.getElementById('previewModal');
  const existingFileModal = document.getElementById('existingFileModal');
  const existingFilemessage = document.getElementById('existingFilemessage');
  const previewData = document.getElementById('dataPreview');
  const downloadButton = document.getElementById('downloadButton');
  const yesButton = document.getElementById('yesButton');
  const previewFileName = document.getElementById('previewFileName');
  const previewTotal = document.getElementById('totalPreview');
  const reportingYear = document.getElementById('reportingYear').value;
  const reportingMonth = document.getElementById('reportingMonth').value;
  const transactionType = "Purchases"

  //drive path 
  const folderPath = 'DATFiles/' + final_tpTIN + '/' + transactionType + '/' + reportingYear;

  // Get the last day of the reporting month
  const newDate = new Date(reportingYear, reportingMonth, 0);
  const lastDay = newDate.getDate();
  const reportingDate = reportingMonth + "/" + lastDay + "/" + reportingYear

  if (noncreditableInputTax ===""){
    var noncreditableInputTax = 0
  }

  var totalInputTax = total[5] - parseFloat(noncreditableInputTax) ;


  // Prepare totals display
  const totalsDisplay = 
`Total Exempt: ${total[0].toFixed(2)}
Total Zero-Rated: ${total[1].toFixed(2)}
Total Services: ${total[2].toFixed(2)}
Total Capital Goods: ${total[3].toFixed(2)}
Total Other Goods: ${total[4].toFixed(2)}
Total Input VAT: ${total[5].toFixed(2)}
Total Non-Creditable Input VAT: ${parseFloat(noncreditableInputTax).toFixed(2)}
Total Creditable Input VAT: ${totalInputTax.toFixed(2)}`;

  // Prepare existing file display
  const existingMessage = 'Existing File Found!' + "\n\n" + 'File Name: ' + datfile_fileName + '\n' + 'Transaction Type: ' + transactionType + '\n' + 'Reporting Period: '  + reportingDate + '\n\n\n' + 'Overwrite this file?';

  //Show loding pop-up
  document.getElementById("loadingPopup").style.display = "block"

  //save to Gdrive
  google.script.run.withSuccessHandler(function(response) {
    if(response === true){
      document.getElementById("loadingPopup").style.display = "none"
      existingFileModal.style.display = 'block';
      existingFilemessage.textContent = existingMessage;

      //add shaky effect
      document.getElementById('existingFileModal2').classList.add("shaky");

      yesButton.onclick = function() {
        document.getElementById("loadingPopup").style.display = "block"
        google.script.run.deleteFileToDrive(datfile_fileName, folderPath, userDriveID, folderDriveID);
        setTimeout(function(){
        previewFileName.textContent = datfile_fileName;
        previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
        previewData.textContent = datContent; // Display the final DAT content
        existingFileModal.style.display = 'none'; // close exitingfile modal
        previewModal.style.display = 'block'; // Show the preview modal
        downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
        google.script.run.uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
        refreshData();
        document.getElementById("loadingPopup").style.display = "none"
        },3000);
      };
      return //cancel futher processing
    }else{
      document.getElementById("loadingPopup").style.display = "none"
      previewFileName.textContent = datfile_fileName;
      previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
      previewData.textContent = datContent; // Display the final DAT content
      previewModal.style.display = 'block'; // Show the modal
      downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
    }
  }).uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
  setTimeout(function(){
    refreshData();
  },1000);
}


function updateInputTaxTotal() {
  var noncreditableInputTax = document.getElementById('noncreditableInputTax').value;

  if (noncreditableInputTax === ""){
    var noncreditableInputTax = 0;
  }
  var creditableInputTax = document.getElementById('creditableInputTax').value;

  if (creditableInputTax === ""){
    var creditableInputTax = 0;
  }

  var total = parseFloat(creditableInputTax) - parseFloat(noncreditableInputTax);
  document.getElementById('totalInputTax').value = total.toFixed(2);
}

//------------------------------------------------------QAP Sched 1 Script--------------------------------------------------//
function processQAP_E(json, header, json2, header2) {
  var error1 = findBlankCellsAndCheckCharacterLimits_QAP1(json);
  var error2 = findBlankCellsAndCheckCharacterLimits_QAP2(json2);

  if (error1.length > 0 || error2.length > 0) {
    alert('Errors found in rows: ' + "\n" + 'sched 1: ' + error1.join(', ') + "\n" + 'sched 2: ' + error2.join(', '));
    return;
  }

  // Checking if the second row has data
  const secondRow = json[1];  // First body row of the first sheet
  const secondRow2 = json2[1]; // First body row of the second sheet

  var dataRow1 = json.length;
  var dataRow2 = json2.length;

  if (!secondRow || secondRow.length === 0 || secondRow.every(cell => cell === null || cell === '')) {
      dataRow1 = 1;
  }

  if (!secondRow2 || secondRow2.length === 0 || secondRow2.every(cell => cell === null || cell === '')) {
      dataRow2 = 1;
  }

  try {

  if (dataRow1 > 1 && dataRow2 > 1) {

    // Sort data for the first sheet
    var sortedData = json.slice(1).sort((a, b) => {
      if (a[2] < b[2]) return -1;
      if (a[2] > b[2]) return 1;
      return 0;
    });

    var sortedJson = [header].concat(sortedData);

    var result = convertToDATFormat_QAP1(sortedJson);
    var data1 = result.datContent;
    var total1 = calculateTotal_QAP1(sortedJson);

    // Sort data for the second sheet
    var sortedData2 = json2.slice(1).sort((a, b) => {
      if (a[2] < b[2]) return -1;
      if (a[2] > b[2]) return 1;
      return 0;
    });

    var sortedJson2 = [header2].concat(sortedData2);
    var result2 = convertToDATFormat_QAP2(sortedJson2);
    var data2 = result2.datContent;
    var total2 = calculateTotal_QAP2(sortedJson2);

    // Remove the first row from data2
    var removeFirstRow = (data) => {
      var rows = data.trim().split('\n');
      rows.shift();
      return rows.join('\n');
    };

    data2 = removeFirstRow(data2);

    // Concatenate the two data strings
    var datContent = `${data1}\n${data2}`;
    var datfile_fileName = result.datfile_fileName;

    // Show the preview
    showPreview_QAP1(datContent, total1, total2, datfile_fileName);

  } else if (dataRow1 > 1 && dataRow2 === 1){
    // Sort data for the first sheet
    var sortedData = json.slice(1).sort((a, b) => {
      if (a[2] < b[2]) return -1;
      if (a[2] > b[2]) return 1;
      return 0;
    });

    var sortedJson = [header].concat(sortedData);

    var result = convertToDATFormat_QAP1(sortedJson);
    var datContent = result.datContent;
    var total1 = calculateTotal_QAP1(sortedJson);
    var datfile_fileName = result.datfile_fileName;
    var total2 = [0];

    // Show the preview
    showPreview_QAP1(datContent, total1, total2, datfile_fileName);

  } else if (dataRow1 === 1 && dataRow2 > 1){

    // Sort data for the second sheet
    var sortedData2 = json2.slice(1).sort((a, b) => {
      if (a[2] < b[2]) return -1;
      if (a[2] > b[2]) return 1;
      return 0;
    });

    var sortedJson2 = [header2].concat(sortedData2);
    var result2 = convertToDATFormat_QAP2(sortedJson2);
    var datContent = result2.datContent;
    var total2 = calculateTotal_QAP2(sortedJson2);
    var datfile_fileName = result2.datfile_fileName;
    var total1 = [0, 0]

    // Show the preview
    showPreview_QAP1(datContent, total1, total2, datfile_fileName);

  } else{alert('Error processing files');}

  } catch (error) {
    console.error('Error processing files:', error);
    alert('Error processing files: ' + error);
  }

}

function convertToDATFormat_QAP1(data) {
  // Get the header and reporting date details
  var reportingMonth = document.getElementById('reportingMonth').value;
  var reportingYear = document.getElementById('reportingYear').value;
  var reportingDate = reportingMonth + "/" + reportingYear;

  // Replace blank cells in columns 9 to 10 with zeros
  for (let i = 0; i < data.length; i++) {
    for (let j = 8; j <= 9; j++) { // Adjusted to cover columns 9 to 10
      if (!data[i][j]) {
        data[i][j] = 0;
      }
    }
  }

  // Preprocess the data to format column 2
  for (let i = 0; i < data.length; i++) {
    if (!data[i][1]) {
      data[i][1] = "0000";
    } else {
      data[i][1] = data[i][1].toString().slice(-4).padStart(4, '0');
    }
  }

  //DAT file header
  const datfile_type = "1601EQ";
  const datfile_companyName = final_companyName === "" 
    ? `"${final_lastName} ${final_firstName} ${final_middleName}"`
    : `"${final_companyName}"`;

  //DAT filename
  const datfile_fileName = final_tpTIN + final_branchCode + reportingMonth + reportingYear + datfile_type + ".DAT";

  // Define the header rows
  const firstRow = [
    "HQAP", 
    "H" + datfile_type, 
    final_tpTIN,
    final_branchCode,
    datfile_companyName,
    reportingDate,
    final_rdoCode,
  ];

  // Calculate sum of 9th to 10th columns
  const total = calculateTotal_QAP1(data);

  const content = [firstRow.join(',')]; // Join with commas

  content.push(...data.slice(1) // Exclude the first row (header)
    .map((row, rowIndex) => {
      // Get only the first 10 columns
      row = row.slice(0, 10);
      
      row.unshift("D1", datfile_type, rowIndex + 1); // Add "D1", datfile_type, and sequence number

      return row.map((cell, index) => {
        if (index >= 5 && index <= 9) {
          cell = String(cell) // Ensure the cell is treated as a string
            .replace(/\s\s+/g, ' ')       // Replace multiple spaces with a single space
            .replace(/&/g, "AND")          // Replace "&" with "AND"
            .replace(/Ñ/g, "N")            // Replace "Ñ" with "N"
            .replace(/[^\w\s]|_/g, "")     // Remove special characters
            .replace(/\r?\n|\r/g, ' ');    // Replace line breaks with a space
        }

        if (typeof cell === 'string') {
          cell = cell.toUpperCase().trim(); // Convert strings to uppercase and trim spaces
        }

        // Remove spaces and special characters, then trim to 9 characters in excel TIN column
        if (index === 3) { // Adjusted to account for unshift
          cell = String(cell).replace(/\W/g, '').substring(0, 9);
        }

        // Ensure number values in 9th to 10th columns have 2 decimal places
        if (index >= 10 && index <= 14) { // Adjusted to account for unshift
          if (!isNaN(cell) && parseFloat(cell) !== 0) {
            return parseFloat(Math.round(cell * 100) / 100).toFixed(2); // Round and ensure 2 decimal places
          }
        }
        // Round numeric values to 2 decimal places for other columns, ensuring they are not zero
        //if (!isNaN(cell) && typeof cell === 'number') {
          //return parseFloat(Math.round(cell * 100) / 100).toFixed(2);
        //}
        return cell;
        
      });
      return row; 
    })
    .map(row => {
      // Insert reportingDate between column 6 and 7 after modification
      row.splice(9, 0, reportingDate);
      return row.map((cell, index) => {
        // Add quotes to the 6th to 9th columns
        if (index >= 5 && index <= 8) { // Adjusted to account for unshift
          return '"' + cell + '"';
        }
        return cell;
      }).join(',');
    }));

  // Add the final row
  const finalRow = [
    "C1",
    datfile_type,
    final_tpTIN,
    final_branchCode,
    reportingDate,
    total[0].toFixed(2),
    total[1].toFixed(2)
  ].join(',');

  content.push(finalRow);

  var datContent = content.join('\n');
  //return content.join('\n');
  return {datContent, datfile_fileName}
}

function convertToDATFormat_QAP2(data) {
  // Get the header and reporting date details
  var reportingMonth = document.getElementById('reportingMonth').value;
  var reportingYear = document.getElementById('reportingYear').value;
  var reportingDate = reportingMonth + "/" + reportingYear;

  // Replace blank cells in columns 9 with zeros
  for (let i = 0; i < data.length; i++) {
    for (let j = 8; j <= 8; j++) { // Adjusted to cover columns 9
      if (!data[i][j]) {
        data[i][j] = 0;
      }
    }
  }

  // Preprocess the data to format column 2
  for (let i = 0; i < data.length; i++) {
    if (!data[i][1]) {
      data[i][1] = "0000";
    } else {
      data[i][1] = data[i][1].toString().slice(-4).padStart(4, '0');
    }
  }

  //DAT file header
  const datfile_type = "1601EQ";
  const datfile_companyName = final_companyName === "" 
    ? `"${final_lastName} ${final_firstName} ${final_middleName}"`
    : `"${final_companyName}"`;

  //DAT filename
  const datfile_fileName = final_tpTIN + final_branchCode + reportingMonth + reportingYear + datfile_type + ".DAT";

  // Define the header rows
  const firstRow = [
    "HQAP", 
    "H" + datfile_type, 
    final_tpTIN,
    final_branchCode,
    datfile_companyName,
    reportingDate,
    final_rdoCode,
  ];

  // Calculate sum of 9th to 10th columns
  const total = calculateTotal_QAP2(data);

  const content = [firstRow.join(',')]; // Join with commas

  content.push(...data.slice(1) // Exclude the first row (header)
    .map((row, rowIndex) => {
      // Get only the first 10 columns
      row = row.slice(0, 8);
      
      row.unshift("D2", datfile_type, rowIndex + 1); // Add "D2", datfile_type, and sequence number

      return row.map((cell, index) => {
        if (index >= 5 && index <= 9) {
          cell = String(cell) // Ensure the cell is treated as a string
            .replace(/\s\s+/g, ' ')       // Replace multiple spaces with a single space
            .replace(/&/g, "AND")          // Replace "&" with "AND"
            .replace(/Ñ/g, "N")            // Replace "Ñ" with "N"
            .replace(/[^\w\s]|_/g, "")     // Remove special characters
            .replace(/\r?\n|\r/g, ' ');    // Replace line breaks with a space
        }

        if (typeof cell === 'string') {
          cell = cell.toUpperCase().trim(); // Convert strings to uppercase and trim spaces
        }

        // Remove spaces and special characters, then trim to 9 characters in excel TIN column
        if (index === 3) { // Adjusted to account for unshift
          cell = String(cell).replace(/\W/g, '').substring(0, 9);
        }

        // Ensure number values in 9th to 10th columns have 2 decimal places
        if (index >= 10 && index <= 10) { // Adjusted to account for unshift
          if (!isNaN(cell) && parseFloat(cell) !== 0) {
            return parseFloat(Math.round(cell * 100) / 100).toFixed(2); // Round and ensure 2 decimal places
          }
        }
        // Round numeric values to 2 decimal places for other columns, ensuring they are not zero
        //if (!isNaN(cell) && typeof cell === 'number') {
          //return parseFloat(Math.round(cell * 100) / 100).toFixed(2);
        //}
        return cell;
        
      });
      return row; 
    })
    .map(row => {
      // Insert reportingDate between column 6 and 7 after modification
      row.splice(9, 0, reportingDate);
      return row.map((cell, index) => {
        // Add quotes to the 6th to 9th columns
        if (index >= 5 && index <= 8) { // Adjusted to account for unshift
          return '"' + cell + '"';
        }
        return cell;
      }).join(',');
    }));

  // Add the final row
  const finalRow = [
    "C2",
    datfile_type,
    final_tpTIN,
    final_branchCode,
    reportingDate,
    total[0].toFixed(2),
  ].join(',');

  content.push(finalRow);

  var datContent = content.join('\n');
  //return content.join('\n');
  return {datContent, datfile_fileName}
}

function calculateTotal_QAP1(data) {
  let total = [0, 0]; // Initialize totals for columns 9 to 10

  data.slice(1).forEach(row => {
    for (let colNum = 8; colNum <= 9; colNum++) { // Columns 9 to 10
      let cell = row[colNum];
      if (cell && !isNaN(cell)) { // Ensure cell is not empty and is a number
        total[colNum - 8] += parseFloat(cell); // Add cell value to total
      }
    }
  });
  return total;
}

function calculateTotal_QAP2(data) {
  let total = [0]; // Initialize totals for columns 8

  data.slice(1).forEach(row => {
    for (let colNum = 7; colNum <= 7; colNum++) { // Columns 8
      let cell = row[colNum];
      if (cell && !isNaN(cell)) { // Ensure cell is not empty and is a number
        total[colNum - 7] += parseFloat(cell); // Add cell value to total
      }
    }
  });
  return total;
}

function findBlankCellsAndCheckCharacterLimits_QAP1(json) {
  const atc_sched1 = [
    "WI010", "WI011", "WI020", "WI021", "WI030", "WI031", "WI040", "WI041", "WI050", "WI051", 
    "WI060", "WI061", "WI070", "WI071", "WI080", "WI081", "WI090", "WI091", "WI100", "WI110", 
    "WI120", "WI130", "WI139", "WI140", "WI151", "WI150", "WI152", "WI153", "WI156", "WI159", 
    "WI640", "WI157", "WI158", "WI160", "WI515", "WI516", "WI530", "WI535", "WI540", "WI610", 
    "WI630", "WI632", "WI650", "WI651", "WI660", "WI661", "WI662", "WI663", "WI680", "WI710", 
    "WI720", "WC010", "WC011", "WC020", "WC021", "WC030", "WC031", "WC040", "WC041", "WC050", 
    "WC051", "WC060", "WC061", "WC070", "WC071", "WC080", "WC081", "WC100", "WC110", "WC120", 
    "WC139", "WC140", "WC151", "WC150", "WC156", "WC640", "WC157", "WC158", "WC160", "WC515", 
    "WC516", "WC535", "WC540", "WC610", "WC630", "WC632", "WC650", "WC651", "WC660", "WC661", 
    "WC662", "WC663", "WC680", "WC690", "WC710", "WC720"
  ];
  
  const invalidRows = [];

  // Checking if the second row has data in either sheet
  const secondRow = json[1];  // First body row of the first sheet

try {
  if (!secondRow || secondRow.length === 0 || secondRow.every(cell => cell === null || cell === '')) {
      console.log("No data in the second row of the first sheet. Ending function.");
      return invalidRows;
  }else{
    for (let i = 1; i < json.length; i++) { // Skip header row
      if (!json[i][2] && (!json[i][3] || !json[i][4])) { // Columns 3 (0-based index)
        invalidRows.push(i + 1); // Add 1 to convert 0-based index to 1-based row number
      }

      if (json[i][2] && !json[i][3] && !json[i][4] && json[i][5]) { // Columns 3 (0-based index)
        invalidRows.push(i + 1); // Add 1 to convert 0-based index to 1-based row number
      }
      
      if (json[i][2] && json[i][2].length > 50) { // Column 3
        invalidRows.push(i + 1);
      }
      for (let colNum = 3; colNum <= 5; colNum++) { // Columns 4 to 6
        if (json[i][colNum] && json[i][colNum].length > 30) {
          invalidRows.push(i + 1);
        }
      }
      if (!atc_sched1.includes(json[i][6])) { // Column 7
        invalidRows.push(i + 1);
      }
    }
    return invalidRows;
  }
} catch (error) {
    console.error('Error processing files:', error);
    alert('Error processing files: ' + error);
}

}

function findBlankCellsAndCheckCharacterLimits_QAP2(json2) {
  const atc_sched2 = [
    "MC040", "MC030", "MC021", "MC020", "MC011", "MC010", "II420", "II130", "II120", "II110", 
    "II090", "II080", "II070", "II060", "II051", "II050", "II020", "II013", "II012", "II011", 
    "II010", "IC370", "IC191", "IC190", "IC170", "IC160", "IC150", "IC140", "IC130", "IC120", 
    "IC101", "IC100", "IC090", "IC080", "IC070", "IC060", "IC055", "IC050", "IC041", "IC040", 
    "IC031", "IC030", "IC021", "IC020", "IC011", "IC010", "FP010", "EI900", "DI900"
  ];

  const invalidRows2 = [];

  const secondRow2 = json2[1]; // First body row of the second sheet

try {

  if (!secondRow2 || secondRow2.length === 0 || secondRow2.every(cell => cell === null || cell === '')) {
    return invalidRows2;
  }else{
    for (let i = 1; i < json2.length; i++) { // Skip header row
      if (!json2[i][2] && (!json2[i][3] || !json2[i][4])) { // Columns 3 (0-based index)
        invalidRows2.push(i + 1); // Add 1 to convert 0-based index to 1-based row number
      }

      if (json2[i][2] && !json2[i][3] && !json2[i][4] && json2[i][5]) { // Columns 3 (0-based index)
        invalidRows2.push(i + 1); // Add 1 to convert 0-based index to 1-based row number
      }

      if (json2[i][2] && json2[i][2].length > 50) { // Column 3
        invalidRows2.push(i + 1);
      }
      for (let colNum = 3; colNum <= 5; colNum++) { // Columns 4 to 6
        if (json2[i][colNum] && json2[i][colNum].length > 30) {
          invalidRows2.push(i + 1);
        }
      }
      if (!atc_sched2.includes(json2[i][6])) { // Column 7
        invalidRows2.push(i + 1);
      }
    }
    return invalidRows2;
  }

} catch (error) {
    console.error('Error processing files:', error);
    alert('Error processing files: ' + error);
}

}

function showPreview_QAP1(datContent, total1, total2, datfile_fileName) {
  const previewModal = document.getElementById('previewModal');
  const existingFileModal = document.getElementById('existingFileModal');
  const existingFilemessage = document.getElementById('existingFilemessage');
  const previewData = document.getElementById('dataPreview');
  const downloadButton = document.getElementById('downloadButton');
  const yesButton = document.getElementById('yesButton');
  const previewFileName = document.getElementById('previewFileName');
  const previewTotal = document.getElementById('totalPreview');
  const reportingYear = document.getElementById('reportingYear').value;
  const reportingMonth = document.getElementById('reportingMonth').value;
  const transactionType = "QAP_Expanded"

  //drive path 
  const folderPath = 'DATFiles/' + final_tpTIN + '/' + transactionType + '/' + reportingYear;

  // Get the last day of the reporting month
  const newDate = new Date(reportingYear, reportingMonth, 0);
  const lastDay = newDate.getDate();
  const reportingDate = reportingMonth + "/" + lastDay + "/" + reportingYear

  // Prepare totals display
  const totalsDisplay = 
  `Total Taxable Income Payment: ${total1[0].toFixed(2)}` + '\n' +
  `Total Exempt Income Payment: ${total2[0].toFixed(2)}` + '\n' +
  `Total Withholding Tax: ${total1[1].toFixed(2)}`

  // Prepare existing file display
  const existingMessage = 'Existing File Found!' + "\n\n" + 'File Name: ' + datfile_fileName + '\n' + 'Transaction Type: ' + transactionType + '\n' + 'Reporting Period: '  + reportingDate + '\n\n\n' + 'Overwrite this file?';

  //Show loding pop-up
  document.getElementById("loadingPopup").style.display = "block"

  //save to Gdrive
  google.script.run.withSuccessHandler(function(response) {
    if(response === true){
      document.getElementById("loadingPopup").style.display = "none"
      existingFileModal.style.display = 'block';
      existingFilemessage.textContent = existingMessage;

      //add shaky effect
      document.getElementById('existingFileModal2').classList.add("shaky");

      yesButton.onclick = function() {
        document.getElementById("loadingPopup").style.display = "block"
        google.script.run.deleteFileToDrive(datfile_fileName, folderPath, userDriveID, folderDriveID);
        setTimeout(function(){
        previewFileName.textContent = datfile_fileName;
        previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
        previewData.textContent = datContent; // Display the final DAT content
        existingFileModal.style.display = 'none'; // close exitingfile modal
        previewModal.style.display = 'block'; // Show the preview modal
        downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
        google.script.run.uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
        refreshData();
        document.getElementById("loadingPopup").style.display = "none"
        },3000);
      };
      return //cancel futher processing
    }else{
      document.getElementById("loadingPopup").style.display = "none"
      previewFileName.textContent = datfile_fileName;
      previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
      previewData.textContent = datContent; // Display the final DAT content
      previewModal.style.display = 'block'; // Show the modal
      downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
    }
  }).uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
  setTimeout(function(){
    refreshData();
  },1000);
}

//----------------------------------------------------1604C Alphalist Script------------------------------------------------//
function process1604C(json, header, json2, header2) {
  try {
    // Validate data and check for errors
    const error1 = findBlankCellsAndCheckCharacterLimits_1604C1(json);
    const error2 = findBlankCellsAndCheckCharacterLimits_1604C2(json2);

    if (error1.length > 0 || error2.length > 0) {
      alert(`Errors found in rows:\nSched 1: ${error1.join(', ')}\nSched 2: ${error2.join(', ')}`);
      return;
    }

    // Check if the second row has data
    const secondRowHasData = (row) => row && row.length > 0 && !row.every(cell => cell === null || cell === '');

    const dataRow1 = secondRowHasData(json[1]) ? json.length : 1;
    const dataRow2 = secondRowHasData(json2[1]) ? json2.length : 1;

    // Sort and process data
    const sortData = (data) => data.slice(1).sort((a, b) => a[1] < b[1] ? -1 : a[1] > b[1] ? 1 : 0);
    
    const removeFirstRow = (data) => {
      const rows = data.trim().split('\n');
      rows.shift();
      return rows.join('\n');
    };

    let datContent = '';
    let datfile_fileName = '';
    let total1 = [];
    let total2 = [];

    if (dataRow1 > 1) {
      const sortedJson1 = [header].concat(sortData(json));
      const result1 = convertToDATFormat_1604C1(sortedJson1);
      datContent = result1.datContent;
      datfile_fileName = result1.datfile_fileName;
      total1 = calculateTotal_1604C1(sortedJson1);
    } else {
      total1 = Array(40).fill(0);  // Fill with zeros
    }

    if (dataRow2 > 1) {
      const sortedJson2 = [header2].concat(sortData(json2));
      const result2 = convertToDATFormat_1604C2(sortedJson2);
      let data2 = result2.datContent;
      total2 = calculateTotal_1604C2(sortedJson2);

      if (dataRow1 > 1) {
        data2 = removeFirstRow(data2);  // Remove the first row only if there's data in both sheets
        datContent += `\n${data2}`;
      } else {
        datContent = data2;
        datfile_fileName = result2.datfile_fileName;
      }
    } else {
      total2 = Array(40).fill(0);  // Fill with zeros
    }

    // Show the preview with the final data
    showPreview_1604C(datContent, total1, total2, datfile_fileName);

  } catch (error) {
    console.error('Error processing files:', error);
    alert(`Error processing files: ${error}`);
  }
}


function convertToDATFormat_1604C1(data) {
  // Get reporting date details
  const reportingMonth = document.getElementById('reportingMonth').value;
  const reportingYear = document.getElementById('reportingYear').value;
  const lastDay = new Date(reportingYear, reportingMonth, 0).getDate();
  const reportingDate = `${reportingMonth}/${lastDay}/${reportingYear}`;

  // Replace blank cells in specified columns with zeros
  const replaceBlankCells = (data, startCol, endCol) => {
    data.forEach(row => {
      for (let j = startCol - 1; j < endCol; j++) {
        if (!row[j]) row[j] = 0;
      }
    });
  };

  replaceBlankCells(data, 7, 17);
  replaceBlankCells(data, 20, 38);
  replaceBlankCells(data, 43, 43);

  // Preprocess column 2 to ensure it's a 4-digit number
  data.forEach(row => {
    row[1] = row[1] ? row[1].toString().slice(-4).padStart(4, '0') : "0000";
  });

  // DAT file header and filename generation
  const datfile_type = "1604C";
  const datfile_companyName = final_companyName ? `"${final_companyName}"` : `"${final_lastName} ${final_firstName} ${final_middleName}"`;
  const datfile_fileName = `${final_tpTIN}${final_branchCode}${reportingMonth}${lastDay}${reportingYear}${datfile_type}.DAT`;

  // Define the header row
  const firstRow = ["H" + datfile_type, final_tpTIN, final_branchCode, reportingDate];
  const content = [firstRow.join(',')];

  // Process and format each row in the data
  data.slice(1).forEach((row, rowIndex) => {
    // Slice the first 43 columns only
    row = row.slice(0, 43);

    // Prepend required fields for each data row
    row.unshift("D1", datfile_type, final_tpTIN, final_branchCode, reportingDate, rowIndex + 1);

    // Format and clean specific columns
    row = row.map((cell, index) => {
      if ((index >= 8 && index <= 11) || (index >= 44 && index <= 47)) {
        cell = cell
          .replace(/\s\s+/g, ' ')       // Replace multiple spaces with a single space
          .replace(/&/g, "AND")          // Replace "&" with "AND"
          .replace(/Ñ/g, "N")            // Replace "Ñ" with "N"
          .replace(/[^\w\s]|_/g, "")     // Remove special characters
          .replace(/\r?\n|\r/g, ' ');    // Replace line breaks with a space
      }

      if (typeof cell === 'string') {
        cell = cell.toUpperCase().trim(); // Convert strings to uppercase and trim spaces
      }

      if (index === 6) {  // TIN column adjustment
        cell = cell.replace(/\W/g, '').substring(0, 9);
      }

      // Ensure numeric values have 2 decimal places
      if (index >= 12 && index <= 48 && !isNaN(cell)) {
        return parseFloat(parseFloat(cell).toFixed(2)).toFixed(2);
      }

      return cell;
    });

    // Add quotes around specific columns
    row = row.map((cell, index) => {
      if (index >= 8 && index <= 10) {
        return `"${cell}"`;
      }
      return cell;
    });

    content.push(row.join(','));
  });

  // Calculate totals and add the final row
  const total = calculateTotal_1604C1(data);
  const finalRow = [
    "C1",
    datfile_type,
    final_tpTIN,
    final_branchCode,
    reportingDate,
    ...total.map(num => num.toFixed(2))
  ].join(',');

  content.push(finalRow);

  // Join all rows into the final DAT content string
  const datContent = content.join('\n');

  return { datContent, datfile_fileName };
}


function convertToDATFormat_1604C2(data) {
  // Get reporting date details
  const reportingMonth = document.getElementById('reportingMonth').value;
  const reportingYear = document.getElementById('reportingYear').value;
  const lastDay = new Date(reportingYear, reportingMonth, 0).getDate();
  const reportingDate = `${reportingMonth}/${lastDay}/${reportingYear}`;

  try {
    // Replace blank cells in specified columns with zeros
    const replaceBlankCells = (data, startCol, endCol) => {
      data.forEach(row => {
        for (let j = startCol - 1; j < endCol; j++) {
          if (!row[j]) row[j] = 0;
        }
      });
    };

    replaceBlankCells(data, 7, 20);
    replaceBlankCells(data, 23, 47);
    replaceBlankCells(data, 52, 53);

    // Preprocess column 2 to ensure it's a 4-digit number
    data.forEach(row => {
      row[1] = row[1] ? row[1].toString().slice(-4).padStart(4, '0') : "0000";
    });

    // DAT file header and filename generation
    const datfile_type = "1604C";
    const datfile_companyName = final_companyName ? `"${final_companyName}"` : `"${final_lastName} ${final_firstName} ${final_middleName}"`;
    const datfile_fileName = `${final_tpTIN}${final_branchCode}${reportingMonth}${lastDay}${reportingYear}${datfile_type}.DAT`;

    // Define the header row
    const firstRow = ["H" + datfile_type, final_tpTIN, final_branchCode, reportingDate];
    const content = [firstRow.join(',')];

    // Process and format each row in the data
    data.slice(1).forEach((row, rowIndex) => {
      row = row.slice(0, 53); // Get only the first 53 columns

      // Prepend required fields for each data row
      row.unshift("D2", datfile_type, final_tpTIN, final_branchCode, reportingDate, rowIndex + 1);

      // Format and clean specific columns
      row = row.map((cell, index) => {
        if ((index >= 8 && index <= 11) || (index >= 52 && index <= 55)) {
          cell = String(cell) // Ensure the cell is treated as a string
            .replace(/\s\s+/g, ' ')       // Replace multiple spaces with a single space
            .replace(/&/g, "AND")          // Replace "&" with "AND"
            .replace(/Ñ/g, "N")            // Replace "Ñ" with "N"
            .replace(/[^\w\s]|_/g, "")     // Remove special characters
            .replace(/\r?\n|\r/g, ' ');    // Replace line breaks with a space
        }

        if (typeof cell === 'string') {
          cell = cell.toUpperCase().trim(); // Convert strings to uppercase and trim spaces
        }

        if (index === 6) { // TIN column adjustment
          cell = cell.replace(/\W/g, '').substring(0, 9);
        }

        // Ensure numeric values have 2 decimal places
        if (index >= 12 && index <= 58 && !isNaN(cell)) {
          return parseFloat(parseFloat(cell).toFixed(2)).toFixed(2);
        }

        return cell;
      });

      // Add quotes around specific columns
      row = row.map((cell, index) => {
        if (index >= 8 && index <= 10) {
          return `"${cell}"`;
        }
        return cell;
      });

      content.push(row.join(','));
    });

    // Calculate totals and add the final row
    const total = calculateTotal_1604C2(data);
    const finalRow = [
      "C2",
      datfile_type,
      final_tpTIN,
      final_branchCode,
      reportingDate,
      ...total.map(num => num.toFixed(2))
    ].join(',');

    content.push(finalRow);

    // Join all rows into the final DAT content string
    const datContent = content.join('\n');
    return { datContent, datfile_fileName };

  } catch (error) {
    console.error('Error processing files:', error);
    alert('Error processing files: ' + error);
    return null;
  }
}


function calculateTotal_1604C1(data) {
  const prevTotal = Array(11).fill(0);
  const presTotal = Array(19).fill(0);
  const peraTotal = [0];

  data.slice(1).forEach(row => {
    // Sum values for columns 7 to 17 (0-based index 6 to 16)
    for (let colNum = 6; colNum <= 16; colNum++) {
      const cell = parseFloat(row[colNum]);
      if (!isNaN(cell)) {
        prevTotal[colNum - 6] += cell;
      }
    }

    // Sum values for columns 20 to 38 (0-based index 19 to 37)
    for (let colNum = 19; colNum <= 37; colNum++) {
      const cell = parseFloat(row[colNum]);
      if (!isNaN(cell)) {
        presTotal[colNum - 19] += cell;
      }
    }

    // Sum value for column 42 (0-based index 42)
    const cell = parseFloat(row[42]);
    if (!isNaN(cell)) {
      peraTotal[0] += cell;
    }
  });

  return [...prevTotal, ...presTotal, ...peraTotal];
}

function calculateTotal_1604C2(data) {
  const prevTotal = Array(14).fill(0);   // For columns 7 to 20 (0-based index 6 to 19)
  const presTotal1 = Array(4).fill(0);   // For columns 23 to 26 (0-based index 22 to 25)
  const presTotal2 = Array(20).fill(0);  // For columns 28 to 47 (0-based index 27 to 46)
  const peraTotal = Array(2).fill(0);    // For columns 52 to 53 (0-based index 51 to 52)

  data.slice(1).forEach(row => {
    // Sum values for columns 7 to 20 (0-based index 6 to 19)
    for (let colNum = 6; colNum <= 19; colNum++) {
      const cell = parseFloat(row[colNum]);
      if (!isNaN(cell)) {
        prevTotal[colNum - 6] += cell;
      }
    }

    // Sum values for columns 23 to 26 (0-based index 22 to 25)
    for (let colNum = 22; colNum <= 25; colNum++) {
      const cell = parseFloat(row[colNum]);
      if (!isNaN(cell)) {
        presTotal1[colNum - 22] += cell;
      }
    }

    // Sum values for columns 28 to 47 (0-based index 27 to 46)
    for (let colNum = 27; colNum <= 46; colNum++) {
      const cell = parseFloat(row[colNum]);
      if (!isNaN(cell)) {
        presTotal2[colNum - 27] += cell;
      }
    }

    // Sum values for columns 52 to 53 (0-based index 51 to 52)
    for (let colNum = 51; colNum <= 52; colNum++) {
      const cell = parseFloat(row[colNum]);
      if (!isNaN(cell)) {
        peraTotal[colNum - 51] += cell;
      }
    }
  });

  return [...prevTotal, ...presTotal1, ...presTotal2, ...peraTotal];
}


function findBlankCellsAndCheckCharacterLimits_1604C1(json) {
  const employmentStatus = ["R", "C", "CP", "S", "P", "AL"];
  const reasonSeparation = ["NA", "T", "TR", "R", "D"];
  const substitutedFiling = ["Y", "N"];
  const region = ["I", "II", "III", "IV-A", "IV-B", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "ARMM", "CAR", "NCR"];
  
  const invalidRows = [];

  try {
    // Checking if the second row has data
    const secondRow = json[1];  // First data row (index 1)
    if (!secondRow || secondRow.every(cell => !cell)) {
      console.log("No data in the second row. Ending function.");
      return invalidRows;
    }

    json.slice(1).forEach((row, index) => {  // Skip header row
      const rowIndex = index + 2;  // Adjust for 1-based index (accounting for header)

      // Check for missing critical data in columns 3, 4, or 5
      if (!row[2] && (!row[3] || !row[4])) {
        invalidRows.push(rowIndex);
      }

      // Check character limits in columns 4, 5, and 6
      for (let colNum = 2; colNum <= 4; colNum++) {
        if (row[colNum] && row[colNum].length > 30) {
          invalidRows.push(rowIndex);
          break;  // Stop checking other columns if one exceeds the limit
        }
      }

      // Validate employment status, reason for separation, substituted filing, and region
      if (!employmentStatus.includes(row[39]) ||
          !reasonSeparation.includes(row[40]) ||
          !substitutedFiling.includes(row[41]) ||
          !region.includes(row[5])) {
        invalidRows.push(rowIndex);
      }
    });

    return invalidRows;

  } catch (error) {
    console.error('Error processing files:', error);
    alert('Error processing files: ' + error);
    return invalidRows;  // Ensure function still returns something in case of error
  }
}

function findBlankCellsAndCheckCharacterLimits_1604C2(json2) {
  const employmentStatus = ["R", "C", "CP", "S", "P", "AL"];
  const reasonSeparation = ["NA", "T", "TR", "R", "D"];
  const substitutedFiling = ["Y", "N"];
  const region = ["I", "II", "III", "IV-A", "IV-B", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "ARMM", "CAR", "NCR"];
  
  const invalidRows = [];

  try {
    // Checking if the second row has data
    const secondRow = json2[1]; // First data row (index 1)
    if (!secondRow || secondRow.every(cell => !cell)) {
      console.log("No data in the second row. Ending function.");
      return invalidRows;
    }

    json2.slice(1).forEach((row, index) => { // Skip header row
      const rowIndex = index + 2; // Adjust for 1-based index (accounting for header)

      // Check for missing critical data in columns 3, 4, or 5
      if (!row[2] && (!row[3] || !row[4])) {
        invalidRows.push(rowIndex);
      }

      // Check character limits in columns 4, 5, and 6
      for (let colNum = 2; colNum <= 4; colNum++) {
        if (row[colNum] && row[colNum].length > 30) {
          invalidRows.push(rowIndex);
          break; // Stop checking other columns if one exceeds the limit
        }
      }

      // Validate employment status, reason for separation, substituted filing, and region
      if (!employmentStatus.includes(row[48]) ||
          !reasonSeparation.includes(row[49]) ||
          !substitutedFiling.includes(row[50]) ||
          !region.includes(row[5])) {
        invalidRows.push(rowIndex);
      }
    });

    return invalidRows;

  } catch (error) {
    console.error('Error processing files:', error);
    alert('Error processing files: ' + error);
    return invalidRows; // Ensure function still returns something in case of error
  }
}


function showPreview_1604C(datContent, total1, total2, datfile_fileName) {
  const previewModal = document.getElementById('previewModal');
  const existingFileModal = document.getElementById('existingFileModal');
  const existingFilemessage = document.getElementById('existingFilemessage');
  const previewData = document.getElementById('dataPreview');
  const downloadButton = document.getElementById('downloadButton');
  const yesButton = document.getElementById('yesButton');
  const previewFileName = document.getElementById('previewFileName');
  const previewTotal = document.getElementById('totalPreview');
  const reportingYear = document.getElementById('reportingYear').value;
  const reportingMonth = document.getElementById('reportingMonth').value;
  const transactionType = "1604C"

  //drive path 
  const folderPath = 'DATFiles/' + final_tpTIN + '/' + transactionType + '/' + reportingYear;

  // Get the last day of the reporting month
  const newDate = new Date(reportingYear, reportingMonth, 0);
  const lastDay = newDate.getDate();
  const reportingDate = reportingMonth + "/" + lastDay + "/" + reportingYear
  const grossCompensation1 = total1[0] + total1[11];
  const grossCompensation2 = total2[0] + total2[14];

  // Prepare totals display
  const totalsDisplay = 
  `Schedule 1:` + '\n' +
  `Total Gross Compensation: ${grossCompensation1.toFixed(2)}` + '\n' +
  `Total Tax Withheld as Adjusted: ${total1[29].toFixed(2)}` + '\n' + '\n' +
  `Schedule 2:` + '\n' +
  `Total Gross Compensation: ${grossCompensation2.toFixed(2)}` + '\n' +
  `Total Tax Withheld as Adjusted: ${total2[37].toFixed(2)}`

  // Prepare existing file display
  const existingMessage = 'Existing File Found!' + "\n\n" + 'File Name: ' + datfile_fileName + '\n' + 'Transaction Type: ' + transactionType + '\n' + 'Reporting Period: '  + reportingDate + '\n\n\n' + 'Overwrite this file?';

  //Show loding pop-up
  document.getElementById("loadingPopup").style.display = "block"

  //save to Gdrive
  google.script.run.withSuccessHandler(function(response) {
    if(response === true){
      document.getElementById("loadingPopup").style.display = "none"
      existingFileModal.style.display = 'block';
      existingFilemessage.textContent = existingMessage;

      //add shaky effect
      document.getElementById('existingFileModal2').classList.add("shaky");

      yesButton.onclick = function() {
        document.getElementById("loadingPopup").style.display = "block"
        google.script.run.deleteFileToDrive(datfile_fileName, folderPath, userDriveID, folderDriveID);
        setTimeout(function(){
        previewFileName.textContent = datfile_fileName;
        previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
        previewData.textContent = datContent; // Display the final DAT content
        existingFileModal.style.display = 'none'; // close exitingfile modal
        previewModal.style.display = 'block'; // Show the preview modal
        downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
        google.script.run.uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
        refreshData();
        document.getElementById("loadingPopup").style.display = "none"
        },3000);
      };
      return //cancel futher processing
    }else{
      document.getElementById("loadingPopup").style.display = "none"
      previewFileName.textContent = datfile_fileName;
      previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
      previewData.textContent = datContent; // Display the final DAT content
      previewModal.style.display = 'block'; // Show the modal
      downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
    }
  }).uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
  setTimeout(function(){
    refreshData();
  },1000);
}

//----------------------------------------------------1604C Alphalist Script------------------------------------------------//
function process1604E(json, header, json2, header2) {


  var error1 = findBlankCellsAndCheckCharacterLimits_1604E1(json);
  var error2 = findBlankCellsAndCheckCharacterLimits_1604E2(json2);

  if (error1.length > 0 || error2.length > 0) {
    alert('Errors found in rows: ' + "\n" + 'sched 1: ' + error1.join(', ') + "\n" + 'sched 2: ' + error2.join(', '));
    return;
  }

  // Checking if the second row has data
  const secondRow = json[1];  // First body row of the first sheet
  const secondRow2 = json2[1]; // First body row of the second sheet

  var dataRow1 = json.length;
  var dataRow2 = json2.length;

  // End function if there's no data in the second row of the first sheet
  if (!secondRow || secondRow.length === 0 || secondRow.every(cell => cell === null || cell === '')) {
      console.log("No data in the second row of the first sheet. Ending function.");
      dataRow1 = 1;
  }

  if (!secondRow2 || secondRow2.length === 0 || secondRow2.every(cell => cell === null || cell === '')) {
      console.log("No data in the second row of the second sheet. Ending function.");
      dataRow2 = 1;
  }

try {

  if (dataRow1 > 1 && dataRow2 > 1) {

  // Sort data for the first sheet
  var sortedData = json.slice(1).sort((a, b) => {
  if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
      return 0;
  });

  var sortedJson = [header].concat(sortedData);
  var result = convertToDATFormat_1604E1(sortedJson);
  var data1 = result.datContent;
  var total1 = calculateTotal_1604E1(sortedJson);

  // Sort data for the second sheet
  var sortedData2 = json2.slice(1).sort((a, b) => {
  if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
      return 0;
  });

  var sortedJson2 = [header2].concat(sortedData2);
  var result2 = convertToDATFormat_1604E2(sortedJson2);
  var data2 = result2.datContent;
  var total2 = calculateTotal_1604E2(sortedJson2);

  // Remove the first row from data2
  var removeFirstRow = (data) => {
    var rows = data.trim().split('\n');
    rows.shift();
    return rows.join('\n');
  };

  data2 = removeFirstRow(data2);

  // Concatenate the two data strings
  var datContent = `${data1}\n${data2}`;
  var datfile_fileName = result.datfile_fileName;

  showPreview_1604E(datContent, total1, total2, datfile_fileName);

  } 
  else if (dataRow1 > 1 && dataRow2 === 1){

  // Sort data for the first sheet
  var sortedData = json.slice(1).sort((a, b) => {
  if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
      return 0;
  });

  var sortedJson = [header].concat(sortedData);
  var result = convertToDATFormat_1604E1(sortedJson);
  var datContent = result.datContent;
  var datfile_fileName = result.datfile_fileName;
  var total1 = calculateTotal_1604E1(sortedJson);
  var total2 = [0]
  showPreview_1604E(datContent, total1, total2, datfile_fileName);

  } 

  else if (dataRow1 === 1 && dataRow2 > 1){

  // Sort data for the first sheet
  var sortedData2 = json2.slice(1).sort((a, b) => {
  if (a[1] < b[1]) return -1;
    if (a[1] > b[1]) return 1;
      return 0;
  });

  var sortedJson2 = [header2].concat(sortedData2);
  var result2 = convertToDATFormat_1604E2(sortedJson2);
  var datContent = result2.datContent;
  var datfile_fileName = result2.datfile_fileName;
  var total2 = calculateTotal_1604E2(sortedJson2);
  var total1 = [0, 0]
  showPreview_1604E(datContent, total1, total2, datfile_fileName);

  }
  
  else{alert('Error processing files' );}

} catch (error) {
    console.error('Error processing files:', error);
    alert('Error processing files: ' + error);
}

}

function convertToDATFormat_1604E1(data) {
  
  // Get the header and reporting date details
  var reportingMonth = document.getElementById('reportingMonth').value;
  var reportingYear = document.getElementById('reportingYear').value;

  // Get the last day of the reporting month
  const newDate = new Date(reportingYear, reportingMonth, 0);
  const lastDay = newDate.getDate();
  const reportingDate = reportingMonth + "/" + lastDay + "/" + reportingYear

  // Replace blank cells in columns 7 to 17 with zeros
  for (let i = 0; i < data.length; i++) {
    for (let j = 7; j <= 9; j++) {
      if (!data[i][j]) {
        data[i][j] = 0;
      }
    }
  }

  // Preprocess the data to format column 2
  for (let i = 0; i < data.length; i++) {
    if (!data[i][1]) {
      data[i][1] = "0000";
    } else {
      data[i][1] = data[i][1].toString().slice(-4).padStart(4, '0');
    }
  }

  //DAT file header
  const datfile_type = "1604E";
  const datfile_companyName = final_companyName === "" 
    ? `"${final_lastName} ${final_firstName} ${final_middleName}"`
    : `"${final_companyName}"`;

  //DAT filename
  const datfile_fileName = final_tpTIN + final_branchCode + reportingMonth + lastDay + reportingYear + datfile_type + ".DAT";

  // Define the header rows
  const firstRow = [
    "H" + datfile_type, 
    final_tpTIN,
    final_branchCode,
    reportingDate
  ];

  // Calculate sum of 9th to 10th columns
  const total = calculateTotal_1604E1(data);

  const content = [firstRow.join(',')]; // Join with commas

  content.push(...data.slice(1) // Exclude the first row (header)
    .map((row, rowIndex) => {
      // Get only the first 10 columns
      row = row.slice(0, 10);
      
      row.unshift("D3", datfile_type, final_tpTIN, final_branchCode, reportingDate, rowIndex + 1);

      return row.map((cell, index) => {
        // Apply the special character removal and linebreak replacement only for columns 9-13
        if ((index >= 8 && index <= 12)) {
            cell = cell
                .replace(/\s\s+/g, ' ') // Replace multiple spaces with a single space
                .replace(/&/g, "AND") // Replace "&" with "AND"
                .replace(/Ñ/g, "N") // Replace "Ñ" with "N"
                .replace(/[^\w\s]|_/g, "") // Remove special characters
                .replace(/\r?\n|\r/g, ' '); // Replace linebreaks with a space
        }

        if (typeof cell === 'string') {
            // Convert to uppercase and trim leading/trailing spaces for all string cells
            cell = cell.toUpperCase().trim();
        }

        // Remove spaces and special characters, then trim to 9 characters in excel TIN column
        if (index === 6) { // Adjusted to account for unshift
          cell = cell.replace(/\W/g, '').substring(0, 9);
        }

        // Ensure number values in 9th to 10th columns have 2 decimal places
        if (index >= 13 && index <= 15) { // Adjusted to account for unshift
          if (!isNaN(cell) && typeof cell === 'number') {
            return parseFloat(Math.round(cell * 100) / 100).toFixed(2); // Round and ensure 2 decimal places
          }
        }
        // Round numeric values to 2 decimal places for other columns, ensuring they are not zero
        //if (!isNaN(cell) && typeof cell === 'number') {
          //return parseFloat(Math.round(cell * 100) / 100).toFixed(2);
        //}
        return cell;
        
      });
      return row; 
    })
    .map(row => {
      return row.map((cell, index) => {
        // Add quotes to the 3 to 5 columns
        if (index >= 8 && index <= 11) { // Adjusted to account for unshift
          return '"' + cell + '"';
        }
        return cell;
      }).join(',');
    }));

  // Add the final row
  const finalRow = [
    "C3",
    datfile_type,
    final_tpTIN,
    final_branchCode,
    reportingDate,
    total[1].toFixed(2)
  ].join(',');


  content.push(finalRow);

  var datContent = content.join('\n');
  //return content.join('\n');
  return {datContent, datfile_fileName}
}

function convertToDATFormat_1604E2(data) {
  
  // Get the header and reporting date details
  var reportingMonth = document.getElementById('reportingMonth').value;
  var reportingYear = document.getElementById('reportingYear').value;

  // Get the last day of the reporting month
  const newDate = new Date(reportingYear, reportingMonth, 0);
  const lastDay = newDate.getDate();
  const reportingDate = reportingMonth + "/" + lastDay + "/" + reportingYear

try {
  // Replace blank cells in columns 7 to 17 with zeros
  for (let i = 0; i < data.length; i++) {
    for (let j = 7; j <= 7; j++) {
      if (!data[i][j]) {
        data[i][j] = 0;
      }
    }
  }

  // Preprocess the data to format column 2
  for (let i = 0; i < data.length; i++) {
    if (!data[i][1]) {
      data[i][1] = "0000";
    } else {
      data[i][1] = data[i][1].toString().slice(-4).padStart(4, '0');
    }
  }

  //DAT file header
  const datfile_type = "1604E";
  const datfile_companyName = final_companyName === "" 
    ? `"${final_lastName} ${final_firstName} ${final_middleName}"`
    : `"${final_companyName}"`;

  //DAT filename
  const datfile_fileName = final_tpTIN + final_branchCode + reportingMonth + lastDay + reportingYear + datfile_type + ".DAT"

  // Define the header rows
  const firstRow = [
    "H" + datfile_type, 
    final_tpTIN,
    final_branchCode,
    reportingDate
  ];

  // Calculate sum of 9th to 10th columns
  const total = calculateTotal_1604E2(data);

  const content = [firstRow.join(',')]; // Join with commas

  content.push(...data.slice(1) // Exclude the first row (header)
    .map((row, rowIndex) => {
      // Get only the first 53 columns
      row = row.slice(0, 8);
      
      row.unshift("D4", datfile_type, final_tpTIN, final_branchCode, reportingDate, rowIndex + 1); 

      return row.map((cell, index) => {
        // Apply the special character removal and linebreak replacement only for columns 8-12
        if ((index >= 8 && index <= 12)) {
            cell = String(cell) // Convert cell to a string
                .replace(/\s\s+/g, ' ') // Replace multiple spaces with a single space
                .replace(/&/g, "AND") // Replace "&" with "AND"
                .replace(/Ñ/g, "N") // Replace "Ñ" with "N"
                .replace(/[^\w\s]|_/g, "") // Remove special characters
                .replace(/\r?\n|\r/g, ' '); // Replace linebreaks with a space
        }

        if (typeof cell === 'string') {
            // Convert to uppercase and trim leading/trailing spaces for all string cells
            cell = cell.toUpperCase().trim();
        }

        // Remove spaces and special characters, then trim to 9 characters in excel TIN column
        if (index === 6) { // Adjusted to account for unshift
          cell = cell.replace(/\W/g, '').substring(0, 9);
        }

        // Ensure number values in 9th to 10th columns have 2 decimal places
        if (index === 13) { // Adjusted to account for unshift
          if (!isNaN(cell) && typeof cell === 'number') {
            return parseFloat(Math.round(cell * 100) / 100).toFixed(2); // Round and ensure 2 decimal places
          }
        }
        // Round numeric values to 2 decimal places for other columns, ensuring they are not zero
        //if (!isNaN(cell) && typeof cell === 'number') {
          //return parseFloat(Math.round(cell * 100) / 100).toFixed(2);
        //}
        return cell;
        
      });
      return row; 
    })
    .map(row => {
      return row.map((cell, index) => {
        // Add quotes to the 3 to 5 columns
        if (index >= 8 && index <= 11) { // Adjusted to account for unshift
          return '"' + cell + '"';
        }
        return cell;
      }).join(',');
    }));

  // Add the final row
  const finalRow = [
    "C4",
    datfile_type,
    final_tpTIN,
    final_branchCode,
    reportingDate,
    total[0].toFixed(2)
  ].join(',');


  content.push(finalRow);

  var datContent = content.join('\n');
  //return content.join('\n');
  return {datContent, datfile_fileName}

} catch (error) {
    console.error('Error processing files:', error);
    alert('Error processing files: ' + error);
}

}

function calculateTotal_1604E1(data) {
  let total = [0, 0];

  data.slice(1).forEach(row => {
    for (let colNum = 8; colNum <= 9; colNum++) { // Columns 9 to 10
      let cell = row[colNum];
      if (cell && !isNaN(cell)) { // Ensure cell is not empty and is a number
        total[colNum - 8] += parseFloat(cell); // Add cell value to total
      }
    }
  });

  return total;
}

function calculateTotal_1604E2(data) {
  let total = [0];

  data.slice(1).forEach(row => {
    for (let colNum = 7; colNum <= 7; colNum++) { // Columns 7 to 20
      let cell = row[colNum];
      if (cell && !isNaN(cell)) { // Ensure cell is not empty and is a number
        total[colNum - 7] += parseFloat(cell); // Add cell value to total
      }
    }
  });

  return total;
}

function findBlankCellsAndCheckCharacterLimits_1604E1(json) {
  const atc_sched1 = [
    "WI010", "WI011", "WI020", "WI021", "WI030", "WI031", "WI040", "WI041", "WI050", "WI051", 
    "WI060", "WI061", "WI070", "WI071", "WI080", "WI081", "WI090", "WI091", "WI100", "WI110", 
    "WI120", "WI130", "WI139", "WI140", "WI151", "WI150", "WI152", "WI153", "WI156", "WI159", 
    "WI640", "WI157", "WI158", "WI160", "WI515", "WI516", "WI530", "WI535", "WI540", "WI610", 
    "WI630", "WI632", "WI650", "WI651", "WI660", "WI661", "WI662", "WI663", "WI680", "WI710", 
    "WI720", "WC010", "WC011", "WC020", "WC021", "WC030", "WC031", "WC040", "WC041", "WC050", 
    "WC051", "WC060", "WC061", "WC070", "WC071", "WC080", "WC081", "WC100", "WC110", "WC120", 
    "WC139", "WC140", "WC151", "WC150", "WC156", "WC640", "WC157", "WC158", "WC160", "WC515", 
    "WC516", "WC535", "WC540", "WC610", "WC630", "WC632", "WC650", "WC651", "WC660", "WC661", 
    "WC662", "WC663", "WC680", "WC690", "WC710", "WC720"
  ];
  
  const invalidRows = [];

  // Checking if the second row has data in either sheet
  const secondRow = json[1];  // First body row of the first sheet

try {
  // Combined condition: if either sheet's second row is empty, end the function
  if (!secondRow || secondRow.length === 0 || secondRow.every(cell => cell === null || cell === '')) {
      console.log("No data in the second row of the first sheet. Ending function.");
      return invalidRows;
  }else{

    for (let i = 1; i < json.length; i++) { // Skip header row
      if (!json[i][2] && (!json[i][3] || !json[i][4])) { // Columns 3 (0-based index)
        invalidRows.push(i + 1); // Add 1 to convert 0-based index to 1-based row number
      }

      for (let colNum = 3; colNum <= 5; colNum++) { // Columns 4 to 6
        if (json[i][colNum] && json[i][colNum].length > 30) {
          invalidRows.push(i + 1);
        }
      }

      if (json[i][2] && json[i][2].length > 50) { // Column 3
        invalidRows.push(i + 1);
      }
      
      if (!atc_sched1.includes(json[i][6])) { // Column 7
        invalidRows.push(i + 1);
      }

    }
    return invalidRows;
  }
  } catch (error) {
    alert('Error processing files: ' + error);
  }

}

function findBlankCellsAndCheckCharacterLimits_1604E2(json2) {
  const atc_sched2 = [
    "MC040", "MC030", "MC021", "MC020", "MC011", "MC010", "II420", "II130", "II120", "II110", 
    "II090", "II080", "II070", "II060", "II051", "II050", "II020", "II013", "II012", "II011", 
    "II010", "IC370", "IC191", "IC190", "IC170", "IC160", "IC150", "IC140", "IC130", "IC120", 
    "IC101", "IC100", "IC090", "IC080", "IC070", "IC060", "IC055", "IC050", "IC041", "IC040", 
    "IC031", "IC030", "IC021", "IC020", "IC011", "IC010", "FP010", "EI900", "DI900"
  ];

  const invalidRows = [];


  // Checking if the second row has data in either sheet
  const secondRow2 = json2[1]; // First body row of the second sheet

try {

  if (!secondRow2 || secondRow2.length === 0 || secondRow2.every(cell => cell === null || cell === '')) {
      return invalidRows;
  }else{
    for (let i = 1; i < json2.length; i++) { // Skip header row
    
      if (!json2[i][2] && (!json2[i][3] || !json2[i][4])) { // Columns 3 (0-based index)
        invalidRows.push(i + 1); // Add 1 to convert 0-based index to 1-based row number
      }

      for (let colNum = 3; colNum <= 5; colNum++) { // Columns 4 to 6
        if (json2[i][colNum] && json2[i][colNum].length > 30) {
          invalidRows.push(i + 1);
        }
      }

      if (json2[i][2] && json2[i][2].length > 50) { // Column 3
        invalidRows.push(i + 1);
      }
      
      if (!atc_sched2.includes(json2[i][6])) { // Column 7
        invalidRows.push(i + 1);
      }

    }
    return invalidRows;
  }

} catch (error) {
  alert('Error processing files: ' + error);
}

}

function showPreview_1604E(datContent, total1, total2, datfile_fileName) {
  const previewModal = document.getElementById('previewModal');
  const existingFileModal = document.getElementById('existingFileModal');
  const existingFilemessage = document.getElementById('existingFilemessage');
  const previewData = document.getElementById('dataPreview');
  const downloadButton = document.getElementById('downloadButton');
  const yesButton = document.getElementById('yesButton');
  const previewFileName = document.getElementById('previewFileName');
  const previewTotal = document.getElementById('totalPreview');
  const reportingYear = document.getElementById('reportingYear').value;
  const reportingMonth = document.getElementById('reportingMonth').value;
  const transactionType = "1604E"

  //drive path 
  const folderPath = 'DATFiles/' + final_tpTIN + '/' + transactionType + '/' + reportingYear;

  // Get the last day of the reporting month
  const newDate = new Date(reportingYear, reportingMonth, 0);
  const lastDay = newDate.getDate();
  const reportingDate = reportingMonth + "/" + lastDay + "/" + reportingYear

  // Prepare totals display
  const totalsDisplay = 
  `Total Taxable Income Payment: ${total1[0].toFixed(2)}` + '\n' +
  `Total Exempt Income Payment: ${total2[0].toFixed(2)}` + '\n' +
  `Total Withholding Tax: ${total1[1].toFixed(2)}`

  // Prepare existing file display
  const existingMessage = 'Existing File Found!' + "\n\n" + 'File Name: ' + datfile_fileName + '\n' + 'Transaction Type: ' + transactionType + '\n' + 'Reporting Period: '  + reportingDate + '\n\n\n' + 'Overwrite this file?';

  //Show loding pop-up
  document.getElementById("loadingPopup").style.display = "block"

  //save to Gdrive
  google.script.run.withSuccessHandler(function(response) {
    if(response === true){
      document.getElementById("loadingPopup").style.display = "none"
      existingFileModal.style.display = 'block';
      existingFilemessage.textContent = existingMessage;

      //add shaky effect
      document.getElementById('existingFileModal2').classList.add("shaky");

      yesButton.onclick = function() {
        document.getElementById("loadingPopup").style.display = "block"
        google.script.run.deleteFileToDrive(datfile_fileName, folderPath, userDriveID, folderDriveID);
        setTimeout(function(){
        previewFileName.textContent = datfile_fileName;
        previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
        previewData.textContent = datContent; // Display the final DAT content
        existingFileModal.style.display = 'none'; // close exitingfile modal
        previewModal.style.display = 'block'; // Show the preview modal
        downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
        google.script.run.uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
        refreshData();
        document.getElementById("loadingPopup").style.display = "none"
        },3000);
      };
      return //cancel futher processing
    }else{
      document.getElementById("loadingPopup").style.display = "none"
      previewFileName.textContent = datfile_fileName;
      previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
      previewData.textContent = datContent; // Display the final DAT content
      previewModal.style.display = 'block'; // Show the modal
      downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
    }
  }).uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
  setTimeout(function(){
    refreshData();
  },1000);
}

//-------------------------------------------------QAP Final Tax Sched 1 Script---------------------------------------------//
function processQAPF1(json, header) {

  var blankCells = findBlankCellsAndCheckCharacterLimits_QAPF1(json);
  if (blankCells.length > 0) {
    alert('Errors found in rows: ' + blankCells.join(', '));
    return;
  }

  //Sort data
  var sortedData = json.slice(1).sort((a, b) => {
  if (a[2] < b[2]) return -1;
    if (a[2] > b[2]) return 1;
      return 0;
  });
  var sortedJson = [header].concat(sortedData);


  var result = convertToDATFormat_QAPF1(sortedJson);
  var datContent = result.datContent;
  var datfile_fileName = result.datfile_fileName;
  var total = calculateTotal_QAPF1(sortedJson);
  showPreview_QAPF1(datContent, total, datfile_fileName);
}

function convertToDATFormat_QAPF1(data) {
  // Get the header and reporting date details
  var reportingMonth = document.getElementById('reportingMonth').value;
  var reportingYear = document.getElementById('reportingYear').value;
  var reportingDate = reportingMonth + "/" + reportingYear;

  // Replace blank cells in columns 9 to 10 with zeros
  for (let i = 0; i < data.length; i++) {
    for (let j = 8; j <= 9; j++) { // Adjusted to cover columns 9 to 10
      if (!data[i][j]) {
        data[i][j] = 0;
      }
    }
  }

  // Preprocess the data to format column 2
  for (let i = 0; i < data.length; i++) {
    if (!data[i][1]) {
      data[i][1] = "0000";
    } else {
      data[i][1] = data[i][1].toString().slice(-4).padStart(4, '0');
    }
  }

  //DAT file header
  const datfile_type = "1601FQ";
  const datfile_companyName = final_companyName === "" 
    ? `"${final_lastName} ${final_firstName} ${final_middleName}"`
    : `"${final_companyName}"`;

  //DAT filename
  const datfile_fileName = final_tpTIN + final_branchCode + reportingMonth + reportingYear + datfile_type + ".DAT";

  // Define the header rows
  const firstRow = [
    "HQAP", 
    "H" + datfile_type, 
    final_tpTIN,
    final_branchCode,
    datfile_companyName,
    reportingDate,
    final_rdoCode,
  ];

  // Calculate sum of 9th to 10th columns
  const total = calculateTotal_QAPF1(data);

  const content = [firstRow.join(',')]; // Join with commas

  content.push(...data.slice(1) // Exclude the first row (header)
    .map((row, rowIndex) => {
      // Get only the first 10 columns
      row = row.slice(0, 10);
      
      row.unshift("D1", datfile_type); // Add "D1", datfile_type, and sequence number

      row.splice(8, 0, rowIndex + 1);

      return row.map((cell, index) => {
        if (typeof cell === 'string') {
          // Convert to uppercase
          cell = cell.toUpperCase();
          // Remove special characters, replace "&" with "AND", and replace "Ñ" with "N"
          cell = String(cell).replace(/\s\s+/g, ' ').replace(/&/g, "AND").replace(/Ñ/g, "N").replace(/[^\w\s]|_/g, "");
          // Remove leading and trailing spaces
          cell = cell.trim();
          // Replace linebreak character with space character
          cell = String(cell).replace(/\r?\n|\r/g, ' ');
        }
        // Remove spaces and special characters, then trim to 9 characters in excel TIN column
        if (index === 3) { // Adjusted to account for unshift
          cell = String(cell).replace(/\W/g, '').substring(0, 9);
        }

        // Ensure number values in 9th to 10th columns have 2 decimal places
        if (index >= 10 && index <= 14) { // Adjusted to account for unshift
          if (!isNaN(cell) && parseFloat(cell) !== 0) {
            return parseFloat(Math.round(cell * 100) / 100).toFixed(2); // Round and ensure 2 decimal places
          }
        }
        // Round numeric values to 2 decimal places for other columns, ensuring they are not zero
        //if (!isNaN(cell) && typeof cell === 'number') {
          //return parseFloat(Math.round(cell * 100) / 100).toFixed(2);
        //}
        return cell;
        
      });
      return row; 
    })
    .map(row => {
      // Insert reportingDate between column 6 and 7 after modification
      row.splice(8, 0, reportingDate);
      return row.map((cell, index) => {
        // Add quotes to the 6th to 9th columns
        if (index >= 4 && index <= 7) { // Adjusted to account for unshift
          return '"' + cell + '"';
        }
        return cell;
      }).join(',');
    }));

  // Add the final row
  const finalRow = [
    "C1",
    datfile_type,
    final_tpTIN,
    final_branchCode,
    reportingDate,
    total[0].toFixed(2),
    total[1].toFixed(2)
  ].join(',');

  content.push(finalRow);

  var datContent = content.join('\n');
  //return content.join('\n');
  return {datContent, datfile_fileName}
}

function calculateTotal_QAPF1(data) {
  let total = [0, 0]; // Initialize totals for columns 9 to 10

  data.slice(1).forEach(row => {
    for (let colNum = 8; colNum <= 9; colNum++) { // Columns 9 to 10
      let cell = row[colNum];
      if (cell && !isNaN(cell)) { // Ensure cell is not empty and is a number
        total[colNum - 8] += parseFloat(cell); // Add cell value to total
      }
    }
  });
  return total;
}

function findBlankCellsAndCheckCharacterLimits_QAPF1(data) {
  const allowedEntriesColumn7 = [
    "WC180", "WI202", "WC190", "WI203", "WC191", "WI224", "WI225", "WC212", "WI226", "WC213", "WI240", "WC222", "WI250", "WC223", "WI260", "WC230", "WI310", "WC250", "WI330", "WC280", "WI340", "WC290", "WI341", "WC300", "WI350", "WC310", "WI380", "WC340", "WI410", "WC410", "W700", "WC700"
  ];

  const invalidRows = [];
  for (let i = 1; i < data.length; i++) { // Skip header row
    if (!data[i][2]) { // Columns 3 (0-based index)
      invalidRows.push(i + 1); // Add 1 to convert 0-based index to 1-based row number
    }
    if (data[i][2] && data[i][2].length > 50) { // Column 3
      invalidRows.push(i + 1);
    }
    for (let colNum = 3; colNum <= 5; colNum++) { // Columns 4 to 6
      if (data[i][colNum] && data[i][colNum].length > 30) {
        invalidRows.push(i + 1);
      }
    }
    if (!allowedEntriesColumn7.includes(data[i][6])) { // Column 7
      invalidRows.push(i + 1);
    }
  }
  return invalidRows;
}

function showPreview_QAPF1(datContent, total, datfile_fileName) {
  const previewModal = document.getElementById('previewModal');
  const existingFileModal = document.getElementById('existingFileModal');
  const existingFilemessage = document.getElementById('existingFilemessage');
  const previewData = document.getElementById('dataPreview');
  const downloadButton = document.getElementById('downloadButton');
  const yesButton = document.getElementById('yesButton');
  const previewFileName = document.getElementById('previewFileName');
  const previewTotal = document.getElementById('totalPreview');
  const reportingYear = document.getElementById('reportingYear').value;
  const reportingMonth = document.getElementById('reportingMonth').value;
  const transactionType = "QAP_Final"

  //drive path 
  const folderPath = 'DATFiles/' + final_tpTIN + '/' + transactionType + '/' + reportingYear;

  // Get the last day of the reporting month
  const newDate = new Date(reportingYear, reportingMonth, 0);
  const lastDay = newDate.getDate();
  const reportingDate = reportingMonth + "/" + lastDay + "/" + reportingYear

  // Prepare totals display
  const totalsDisplay =
  `Total Income Payment: ${total[0].toFixed(2)}` + '\n\n' +
  `Total Withholding Tax: ${total[1].toFixed(2)}`

  // Prepare existing file display
  const existingMessage = 'Existing File Found!' + "\n\n" + 'File Name: ' + datfile_fileName + '\n' + 'Transaction Type: ' + transactionType + '\n' + 'Reporting Period: '  + reportingDate + '\n\n\n' + 'Overwrite this file?';

  //Show loding pop-up
  document.getElementById("loadingPopup").style.display = "block"

  //save to Gdrive
  google.script.run.withSuccessHandler(function(response) {
    if(response === true){
      document.getElementById("loadingPopup").style.display = "none"
      existingFileModal.style.display = 'block';
      existingFilemessage.textContent = existingMessage;

      //add shaky effect
      document.getElementById('existingFileModal2').classList.add("shaky");

      yesButton.onclick = function() {
        document.getElementById("loadingPopup").style.display = "block"
        google.script.run.deleteFileToDrive(datfile_fileName, folderPath, userDriveID, folderDriveID);
        setTimeout(function(){
        previewFileName.textContent = datfile_fileName;
        previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
        previewData.textContent = datContent; // Display the final DAT content
        existingFileModal.style.display = 'none'; // close exitingfile modal
        previewModal.style.display = 'block'; // Show the preview modal
        downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
        google.script.run.uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
        refreshData();
        document.getElementById("loadingPopup").style.display = "none"
        },3000);
      };
      return //cancel futher processing
    }else{
      document.getElementById("loadingPopup").style.display = "none"
      previewFileName.textContent = datfile_fileName;
      previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
      previewData.textContent = datContent; // Display the final DAT content
      previewModal.style.display = 'block'; // Show the modal
      downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
    }
  }).uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
  setTimeout(function(){
    refreshData();
  },1000);
}

//------------------------------------------------------SAWT Script--------------------------------------------------//
function processSAWT(json, header, selectedSAWT) {

  var blankCells = findBlankCellsAndCheckCharacterLimits_SAWT(json);
  if (blankCells.length > 0) {
    alert('Errors found in rows: ' + blankCells.join(', '));
    return;
  }

  //Sort data
  var sortedData = json.slice(1).sort((a, b) => {
  if (a[2] < b[2]) return -1;
    if (a[2] > b[2]) return 1;
      return 0;
  });
  var sortedJson = [header].concat(sortedData);


  var result = convertToDATFormat_SAWT(sortedJson, selectedSAWT);
  var datContent = result.datContent;
  var datfile_fileName = result.datfile_fileName;
  var total = calculateTotal_SAWT(sortedJson);
  showPreview_SAWT(datContent, total, datfile_fileName, selectedSAWT);
}

function convertToDATFormat_SAWT(data, selectedSAWT) {
  // Get the header and reporting date details
  var reportingMonth = document.getElementById('reportingMonth').value;
  var reportingYear = document.getElementById('reportingYear').value;
  var reportingDate = reportingMonth + "/" + reportingYear;

  // Replace blank cells in columns 9 to 10 with zeros
  for (let i = 0; i < data.length; i++) {
    for (let j = 8; j <= 9; j++) { // Adjusted to cover columns 9 to 10
      if (!data[i][j]) {
        data[i][j] = 0;
      }
    }
  }

  // Preprocess the data to format column 2
  for (let i = 0; i < data.length; i++) {
    if (!data[i][1]) {
      data[i][1] = "0000";
    } else {
      data[i][1] = data[i][1].toString().slice(-4).padStart(4, '0');
    }
  }

  //DAT file header
  const datfile_type = selectedSAWT;
  const datfile_companyName = final_companyName === "" ? final_companyName : '"' + final_companyName + '"';
  const datfile_lastName = final_lastName === "" ? final_lastName : '"' + final_lastName + '"';
  const datfile_firstName = final_firstName === "" ? final_firstName : '"' + final_firstName + '"';
  const datfile_middleName = final_middleName === "" ? final_middleName : '"' + final_middleName + '"';

  //DAT filename
  const datfile_fileName = final_tpTIN + final_branchCode + reportingMonth + reportingYear + datfile_type + ".DAT";

  // Define the header rows
  const firstRow = [
    "HSAWT", 
    "H" + datfile_type, 
    final_tpTIN,
    final_branchCode,
    datfile_companyName,
    datfile_lastName,
    datfile_firstName,
    datfile_middleName,
    reportingDate,
    final_rdoCode,
  ];

  // Calculate sum of 9th to 10th columns
  const total = calculateTotal_SAWT(data);

  const content = [firstRow.join(',')]; // Join with commas

  content.push(...data.slice(1) // Exclude the first row (header)
    .map((row, rowIndex) => {
      // Get only the first 10 columns
      row = row.slice(0, 10);
      
      row.unshift("DSAWT", 'D' + datfile_type, rowIndex + 1); // Add "D1", datfile_type, and sequence number

      return row.map((cell, index) => {
        if (typeof cell === 'string') {
          // Convert to uppercase
          cell = cell.toUpperCase();
          // Remove special characters, replace "&" with "AND", and replace "Ñ" with "N"
          cell = String(cell).replace(/\s\s+/g, ' ').replace(/&/g, "AND").replace(/Ñ/g, "N").replace(/[^\w\s]|_/g, "");
          // Remove leading and trailing spaces
          cell = cell.trim();
          // Replace linebreak character with space character
          cell = String(cell).replace(/\r?\n|\r/g, ' ');
        }
        // Remove spaces and special characters, then trim to 9 characters in excel TIN column
        if (index === 3) { // Adjusted to account for unshift
          cell = String(cell).replace(/\W/g, '').substring(0, 9);
        }

        // Ensure number values in 9th to 10th columns have 2 decimal places
        if (index >= 10 && index <= 14) { // Adjusted to account for unshift
          if (!isNaN(cell) && parseFloat(cell) !== 0) {
            return parseFloat(Math.round(cell * 100) / 100).toFixed(2); // Round and ensure 2 decimal places
          }
        }
        // Round numeric values to 2 decimal places for other columns, ensuring they are not zero
        //if (!isNaN(cell) && typeof cell === 'number') {
          //return parseFloat(Math.round(cell * 100) / 100).toFixed(2);
        //}
        return cell;
        
      });
      return row; 
    })
    .map(row => {
      // Insert reportingDate between column 6 and 7 after modification
      row.splice(9, 0, reportingDate + ',');
      return row.map((cell, index) => {
        // Add quotes to the 6th to 9th columns
        if (index >= 5 && index <= 8) { // Adjusted to account for unshift
          return '"' + cell + '"';
        }
        return cell;
      }).join(',');
    }));

  // Add the final row
  const finalRow = [
    "CSAWT",
    'C' + datfile_type,
    final_tpTIN,
    final_branchCode,
    reportingDate,
    total[0].toFixed(2),
    total[1].toFixed(2)
  ].join(',');

  content.push(finalRow);

  var datContent = content.join('\n');
  return {datContent, datfile_fileName}
}

function calculateTotal_SAWT(data) {
  let total = [0, 0]; // Initialize totals for columns 9 to 10

  data.slice(1).forEach(row => {
    for (let colNum = 8; colNum <= 9; colNum++) { // Columns 9 to 10
      let cell = row[colNum];
      if (cell && !isNaN(cell)) { // Ensure cell is not empty and is a number
        total[colNum - 8] += parseFloat(cell); // Add cell value to total
      }
    }
  });
  return total;
}

function findBlankCellsAndCheckCharacterLimits_SAWT(data) {
  const allowedEntriesColumn7 = [
    "WI010", "WI011", "WI020", "WI021", "WI030", "WI031", "WI040", "WI041", "WI050", "WI051", 
    "WI060", "WI061", "WI070", "WI071", "WI080", "WI081", "WI090", "WI091", "WI100", "WI110", 
    "WI120", "WI130", "WI139", "WI140", "WI151", "WI150", "WI152", "WI153", "WI156", "WI159", 
    "WI640", "WI157", "WI158", "WI160", "WI515", "WI516", "WI530", "WI535", "WI540", "WI610", 
    "WI630", "WI632", "WI650", "WI651", "WI660", "WI661", "WI662", "WI663", "WI680", "WI710", 
    "WI720", "WC010", "WC011", "WC020", "WC021", "WC030", "WC031", "WC040", "WC041", "WC050", 
    "WC051", "WC060", "WC061", "WC070", "WC071", "WC080", "WC081", "WC100", "WC110", "WC120", 
    "WC139", "WC140", "WC151", "WC150", "WC156", "WC640", "WC157", "WC158", "WC160", "WC515", 
    "WC516", "WC535", "WC540", "WC610", "WC630", "WC632", "WC650", "WC651", "WC660", "WC661", 
    "WC662", "WC663", "WC680", "WC690", "WC710", "WC720", "WV010", "WV020", "WV040", "WV050", 
    "WV060", "WV070", "WV012", "WV014", "WV022", "WV024", "WB030", "WB040", "WB050", "WB070", 
    "WB090", "WB120", "WB121", "WB130", "WB140", "WB150", "WB160", "WB170", "WB180", "WB200", 
    "WB201", "WB202", "WB203", "WB301", "WB303", "WB102", "WB103", "WB104", "WB108", "WB109", 
    "WB110", "WB080", "WB082", "WB084"
  ];

  const invalidRows = [];
  for (let i = 1; i < data.length; i++) { // Skip header row
    if (!data[i][2]) { // Columns 3 (0-based index)
      invalidRows.push(i + 1); // Add 1 to convert 0-based index to 1-based row number
    }
    if (data[i][2] && data[i][2].length > 50) { // Column 3
      invalidRows.push(i + 1);
    }
    for (let colNum = 3; colNum <= 5; colNum++) { // Columns 4 to 6
      if (data[i][colNum] && data[i][colNum].length > 30) {
        invalidRows.push(i + 1);
      }
    }
    if (!allowedEntriesColumn7.includes(data[i][6])) { // Column 7
      invalidRows.push(i + 1);
    }
  }
  return invalidRows;
}

function showPreview_SAWT(datContent, total, datfile_fileName, selectedSAWT) {
  const previewModal = document.getElementById('previewModal');
  const existingFileModal = document.getElementById('existingFileModal');
  const existingFilemessage = document.getElementById('existingFilemessage');
  const previewData = document.getElementById('dataPreview');
  const downloadButton = document.getElementById('downloadButton');
  const yesButton = document.getElementById('yesButton');
  const previewFileName = document.getElementById('previewFileName');
  const previewTotal = document.getElementById('totalPreview');
  const reportingYear = document.getElementById('reportingYear').value;
  const reportingMonth = document.getElementById('reportingMonth').value;
  const transactionType = "SAWT_" + selectedSAWT

  //drive path 
  const folderPath = 'DATFiles/' + final_tpTIN + '/' + transactionType + '/' + reportingYear;

  // Get the last day of the reporting month
  const newDate = new Date(reportingYear, reportingMonth, 0);
  const lastDay = newDate.getDate();
  const reportingDate = reportingMonth + "/" + lastDay + "/" + reportingYear

  // Prepare totals display
  const totalsDisplay = 
  `Total Income Payment: ${total[0].toFixed(2)}` + '\n\n' +
  `Total Withholding Tax: ${total[1].toFixed(2)}`;

  // Prepare existing file display
  const existingMessage = 'Existing File Found!' + "\n\n" + 'File Name: ' + datfile_fileName + '\n' + 'Transaction Type: ' + transactionType + '\n' + 'Reporting Period: '  + reportingDate + '\n\n\n' + 'Overwrite this file?';

  //Show loding pop-up
  document.getElementById("loadingPopup").style.display = "block"

  //save to Gdrive
  google.script.run.withSuccessHandler(function(response) {
    if(response === true){
      document.getElementById("loadingPopup").style.display = "none"
      existingFileModal.style.display = 'block';
      existingFilemessage.textContent = existingMessage;

      //add shaky effect
      document.getElementById('existingFileModal2').classList.add("shaky");

      yesButton.onclick = function() {
        document.getElementById("loadingPopup").style.display = "block"
        google.script.run.deleteFileToDrive(datfile_fileName, folderPath, userDriveID, folderDriveID);
        setTimeout(function(){
        previewFileName.textContent = datfile_fileName;
        previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
        previewData.textContent = datContent; // Display the final DAT content
        existingFileModal.style.display = 'none'; // close exitingfile modal
        previewModal.style.display = 'block'; // Show the preview modal
        downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
        google.script.run.uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
        refreshData();
        document.getElementById("loadingPopup").style.display = "none"
        },3000);
      };
      return //cancel futher processing
    }else{
      document.getElementById("loadingPopup").style.display = "none"
      previewFileName.textContent = datfile_fileName;
      previewTotal.textContent = totalsDisplay + "\n\n"; // Display the final DAT content
      previewData.textContent = datContent; // Display the final DAT content
      previewModal.style.display = 'block'; // Show the modal
      downloadButton.onclick = function() {downloadDATFile(datContent, datfile_fileName);};
    }
  }).uploadFileToDrive(datContent, datfile_fileName, folderPath, userDriveID, folderDriveID);
  setTimeout(function(){
    refreshData();
  },1000);
}

function downloadDATFile(datContent, datfile_fileName) {
  const blob = new Blob([datContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = datfile_fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

//-------------------------------------------------DAT File Manager-----------------------------------------------------
var currentPage = 1;
var numFilesPerPage = 12; // Set to 12 as per your requirement
var files;
var selectedFiles = new Set();
var selectedType = null;
var selectedYear = null;
var selectedTin = null;
var selectedQuarter = null;
var sortOrder = {
    column: null,
    order: null
};

    // Mapping object for ATC code to description
    const atcDescriptions = {
      "WI010": "Professionals (Lawyers, CPAs, Engineers, etc.)- If gross income for the current year did not exceed P3M",
      "WC010": "Professionals/ talent fees paid to juridical persons - If the current year’s gross income is P720,000 and below",
      "WC011": "Professionals/ talent fees paid to juridical persons - If the current year’s gross income exceeds P 720,000",
      "WI020": "Professional entertainers, such as, but not limited to, actors and actresses, singers, lyricist, composers, emcees - If gross income for the current year did not exceed P3M",
      "WI030": "Professional athletes, including basketball players, pelotaris and jockeys - If gross income for the current year did not exceed P3M",
      "WI040": "All directors and producers involved in movies, stage, radio, television and musical productions - If gross income for the current year did not exceed P3M",
      "WI050": "Management and technical consultants - If gross income for the current year did not exceed P3M",
      "WC050": "Management and technical consultants paid to juridical person - If the current year’s gross income is P 720,000 and below",
      "WC051": "Management and technical consultants paid to juridical person - If the currents year’s gross income exceeds P720,000",
      "WI060": "Business and bookkeeping agents and agencies - If gross income for the current year did not exceed P3M",
      "WI070": "Insurance agents and insurance adjusters - If gross income for the current year did not exceed P3M",
      "WI080": "Other recipients of talent fees - If gross income for the current year did not exceed P3M",
      "WI090": "Fees of directors who are not employees of the company - If gross income for the current year did not exceed P3M",
      "WI100": "Rentals- real/personal properties, poles, satellites & transmission facilities, billboards - Individual",
      "WC100": "Rentals- real/personal properties, poles, satellites & transmission facilities, billiboards - Corporate",
      "WI110": "Cinematographic film rentals - Individual",
      "WC110": "Cinematographic film rentals - Corporate",
      "WI120": "Income payments to prime contractors/sub-contractors - Individual",
      "WC120": "Income payments to prime contractors/sub-contractors - Corporate",
      "WI130": "Income distribution to beneficiaries of estates and trusts",
      "WI140": "Gross commission or service fees of custom, insurance, stock, real estate, immigration and commercial brokers & fees of agents of professional entertainers - If gross income is more than P3M or VAT Registered regardless of amount",
      "WC140": "Gross commission or service fees of custom, insurance, stock, real estate, immigration and commercial brokers & fees of agents of professional entertainers - if gross income exceeds 720,000- Corporate",
      "WI516": "Commission, rebates, discounts & other similar considerations pd/granted to indepndnt & exclusive sales reps & mkting agents & sub-agents of multi-level mktng co. inc. multilevel mrkting co.-if gross income > P3M or VAT Registered regardless of amt",
      "WC516": "Commission, rebates, discounts & other similar considerations pd/granted to indepndnt & exclusive sales reps & mkting agents & sub-agents of multi-level mrktng co. inc. multilevel mrkting co.-if gross income exceeds P720,000",
      "WI151": "Payments for medical/dental/veterinary services thru Hospitals/ Clinics/Health Maintenance Organizations, including direct payments to service providers - If gross income for the current year did not exceed P3M",
      "WI152": "Payment by the general professional partnerships (GPP) to its partners - If gross income for the current year did not exceed P720,000",
      "WI156": "Payments made by credit card companies - Individual",
      "WC156": "Payments made by credit card companies - Corporate",
      "WI640": "Income payments made by the government to its local/resident suppliers of goods - Individual",
      "WC640": "Income payments made by the government to its local/resident suppliers of goods - Corporate",
      "WI157": "Income payments made by the government to its local/resident suppliers of service - Individual",
      "WC157": "Income payments made by the government to its local/resident suppliers of services - Corporate",
      "WI158": "Income payment made by top withholding agents to their local/resident supplier of goods other than those covered by other rates of withholding tax - Individual",
      "WC158": "Income payment made by top withholding agents to their local/resident supplier of goods other than those covered by other rates of withholding tax - Corporate",
      "WI160": "Income payment made by top withholding agents to their local/resident supplier of services other than those covered by other rates of withholding tax - Individual",
      "WC160": "Income payment made by top withholding agents to their local/resident supplier of services other than those covered by other rates of withholding tax - Corporate",
      "WI159": "Additional payments to government personnel from importers, shipping and airline companies or their agents for overtime services",
      "WI515": "Commission, rebates, discounts & other similar considerations pd/granted to indepndnt & exclusive sales reps & mkting agents & sub-agents of multi-level marketing co. inc. multilevel mrkting co.- If gross income for the current yr did not exceed P3M",
      "WC515": "Commission, rebates, discounts and other similar considerations paid/granted to independent & exclusive distributors, medical/technical & sales representatives & marketing agents and sub-agents of multi-level marketing companies - Corporate",
      "WI530": "Gross payments to embalmers by funeral parlors",
      "WI535": "Payments made by pre-need companies to funeral parlors - Individual",
      "WC535": "Payments made by pre-need companies to funeral parlors - Corporate",
      "WI540": "Tolling fee paid to refineries - Individual",
      "WC540": "Tolling fee paid to refineries - Corporate",
      "WI610": "Income payments made to suppliers of Agricultural products - Individual",
      "WC610": "Income payments made to suppliers of Agricultural products - Corporate",
      "WI630": "Income payments on purchases of minerals, mineral products & quarry resources - Individual",
      "WC630": "Income payments on purchases of minerals, mineral products & quarry resources - Corporate",
      "WI632": "Income payments on purchases of gold by Bangko Sentral ng Pilipinas (BSP) from gold miners/suppliers under PD 1899, as amended by R.A. No. 7076- Individual",
      "WC632": "Income payments on purchases of gold by Bangko Sentral ng Pilipinas (BSP) from gold miners/suppliers under PD 1899, as amended by R.A. No. 7076- Corporate",
      "WI650": "On gross amount of refund given by Meralco to customers with active contracts as classified by Meralco - Individual",
      "WC650": "On gross amount of refund given by Meralco to customers with active contracts as classified by Meralco - Corporate",
      "WI651": "On gross amount of refund given by Meralco to customers with terminated contracts as classified by Meralco - Individual",
      "WC651": "On gross amount of refund given by Meralco to customers with terminated contracts as classified by Meralco - Corporate",
      "WI660": "WITHHOLDING ON GROSS AMOUNT OF INTEREST ON THE REFUND OF METER DEPOSIT WHETHER PAID DIRECTLY TO THE CUSTOMERS OR APPLIED AGAINST CUSTOMER'S BILLING - RESIDENTIAL AND GENERAL SERVICE CUSTOMERS WHOSE MONTHLY ELECTRICITY CONSUMPTION EXCEEDS 200 KWH AS C",
      "WC660": "WITHHOLDING ON GROSS AMOUNT OF INTEREST ON THE REFUND OF METER DEPOSIT WHETHER PAID DIRECTLY TO THE CUSTOMERS OR APPLIED AGAINST CUSTOMER'S BILLING - RESIDENTIAL AND GENERAL SERVICE CUSTOMERS WHOSE MONTHLY ELECTRICITY CONSUMPTION EXCEEDS 200 KWH AS C",
      "WI661": "WITHHOLDING ON GROSS AMOUNT OF INTERST ONT HE REFIND OF METER DEPOSIT WHETER PAID DIRECTLY TO THE CUSTOMERS OR APPLIED AGAINST CUSTOMER'S BILLING - RESIDENTIAL AND GENERA; SERVICE CUSTOMERS WHOSE MONTLY ELECTRICITY CONSUMPTION EXCEEDS200 KWH AS CLASS",
      "WC661": "WITHHOLDING ON GROSS AMOUNT OF INTEREST ON THE REFUND OF METER DEPOSIT WHETHER PAID DIRECTLY TO THE CUSTOMERS OR APPLIED AGAINST CUSTOMER'S BILLING - NON - RESIDENTIAL CUSTOMERS WHOSE MONTLY ELECTRICITY CONSUMPTION EXCEEDS 200 KWH AS CLASSIFIED BY ME",
      "WI662": "WITHHOLDING ON GROSS AMOUNT OF INTERESTO N THE REFUND OF METER DEPOSIT WHETHER PAID DIRECTLY TO THE CUSTOMERS OR APPLIED AGAINST CUSTOMER'S BILLING - RESIDENTIAL AND GENERAL SERVICE CUSTOMERS WHOSE MONTLY ELECTRICITY CONSUMPTION EXCEEDS 200 KWH AS CL",
      "WC662": "WITHHOLDING ON GROSS AMOUNT OF INTEREST ON THE REFUND OF METER DEPOSIT WHETHEER PAID DIRECTLY TO THE CUSTOMERS OR APPLIED AGAINST CUSTOMER'S BILLING - RESIDENTIAL AND GENERAL SERVICE CUSTOMERS WHOSE MONTLY ELECTRICITY CONSUMPTION EXCEEDS 200 KWH AS C",
      "WI663": "WITHHOLDING ON GROSS AMOUNT OF INTEREST ON THE REFUND OF METER DEPOSIT WHETER PAID DIRECTLY TO THE CUSTOMERS OR APPLIED AGAINST CUSTOMER'S BILLING - NON - RESIDENTIAL CUSTOMERS WHOSE MONTLY ELECTRICITY CONSUMPTION EXCEEDS 200 KWH AS CLASSIFIED BY OTH",
      "WC663": "WITHHOLDING ON GROSS AMOUNT OF INTEREST ON THE REFUND OF METER DEPOSIT WHETHER PAID DIRECTLY TO THE CUSTOMERS OR APPLIED CUSTOMER'S BILLING - NON - RESIDENTIAL CUSTOMERS WHOSE MONTLY ELECTRICITY CONSUMPTION EXCEEDS 200 KWH AS CLASSIFIED BY OTHER ELEC",
      "WI680": "INCOME PAYMENTS MADE BY POLITICAL PARTIES AND CANDIDATES OF LOCAL AND NATIONAL ELECTIONS OF ALL THEIR CAMPAIGN EXPENDITURES, AND INCOME PAYMENTS MADE BY INDIVIDUALS OR JURIDICAL PERSONS FOR THEIR PURCHASES OF GOODS AND SERVICES INTENDED TO BE GIVEN",
      "WC680": "INCOME PAYMENTS MADE BY POLITICAL PARTIES AND CANDIDATES OF LOCAL AND NATIONAL ELECTIONS OF ALL THEIR CAMPAIGN EXPENDITURES, AND INCOME PAYMENTS MADE BY INDIVIDUALS OR JURIDICAL PERSONS FOR THEIR PURCHASES OF GOODS AND SERVICES INTENDED TO BE GIVEN A",
      "WC710": "INTEREST INCOME DERIVED FROM ANY OTHER DEBT INSTRUMENTS NOT WITHIN THE COVERAGE OF DEPOSIT SUBSTITUTES",
      "WI710": "INTEREST INCOME DERIVED FROM ANY OTHER DEBT INSTRUMENTS NOT WITHIN THE COVERAGE OF DEPOSIT SUBSTITUTES",
      "WI011": "Professional (Lawyers, CPAs, Engineers, etc) - If gross Income is more than P3M or VAT Registered regardless of amount",
      "WI021": "Professional entertainers such as, but not limited to actors & actresses, singers, lyricists, composers, emcees - If gross Income is more than P3M or VAT Registered regardless of amount",
      "WI031": "Professional athletes including basketball players, pelotaris and jockeys - If gross income is more than P3M of VAT Registered regardless of amount",
      "WI041": "All directors and producers involved in movies, stage, radio, television and musical productions - If gross income is more than P3M of VAT Registered regardless of amount",
      "WI051": "Management and technical consultants - If gross income is more than P3M of VAT Registered regardless of amount",
      "WI061": "Business and bookkeeping agents and agencies - If gross income is more that P3M of VAT Registered regardless of amount",
      "WI071": "Insurance agents and insurance adjusters - If gross income is more than P3M of VAT Registered regardless of amount",
      "WI081": "Other recipients of talent fees - If gross income is more than P3M or VAT Registered regardless of amount",
      "WI091": "Fees of directors who are not employees of the company - If gross income is more than P3M of VAT Registered regardless of amount",
      "WI139": "Gross commission or service fees of custom, insurance, stock, real estate, immigration and commercial brokers & fees of agents of professional entertainers - If gross income for the current year did not exceed P3M",
      "WI150": "Payments for medical/dental/veterinary services thru Hospitals/ Clinics/Health Maintenance Organizations, including direct payments to service providers - If gross income > P3M of VAT Registered regardless of amount",
      "WC151": "Professional fees paid to medical practitioners (inc.doctors of medicine doctors of veterinary sciences & dentists) by hospitals & clinics or paid directly by Health Maintenance Org (HMOs) &/or similar est - If gross income for the current yr < P720K",
      "WC150": "Professional fees paid to medical practitioners (inc.doctors of medicine doctors of veterinary sciences & dentists) by hospitals & clinics or paid directly by Health Maintenance Org (HMOs) &/or similar est - If gross income exceeds P720K",
      "WI153": "Payment by the General Professional Partnerships (GPPs) to its partners - If gross income exceeds P720,000",
      "WI156": "Income payments made by credit card companies - Individual",
      "WC156": "Income payments made by credit card companies - Corporation",
      "WC690": "Income payments received by Real Estate Investment Trust (REIT)",
      "WI720": "Income payments on locally produced raw sugar - Individual",
      "WC720": "Income payments on locally produced raw sugar - Corporation",
      "WC139": "Gross commission or service fees of custom, insurance, stock, real estate, immigration and commercial brokers & fees of agents of professional entertainers - if gross income did not exceed 720,000- Corporate",
      "MC040": "INCOME FROM FORFEITED PROPERTIES",
      "MC030": "COMP. PYMTS ON DELQNT. ACCOUNTS & DISP. ASSESSMENTS",
      "MC021": "CORPORATE TAXPAYERS",
      "MC020": "TAX AMNESTY ON INCOME (CORPORATE)",
      "MC011": "INDIVIDUAL TAXPAYERS",
      "MC010": "TAX AMNESTY ON INCOME (INDIVIDUAL)",
      "II420": "CGT ON SALE OF REAL PROPERTY (CAPITAL ASSETS) FOR INDIV",
      "II130": "PARTNERS DISTRIB SHARE OF NET INC OF GEN PARTNERSHIP",
      "II120": "PRIZES AMOUNTING TO: 10,000 OR LESS",
      "II110": "INTEREST - (INDIVIDUAL PAYEES)",
      "II090": "TRANSPO CONTR (INDIVIDUAL)  CARRIAGE OF GOODS AND MERCHDSE BELOW 2,000",
      "II080": "OTHERS (SPECIFY) - (INDIVIDUAL PAYEES)",
      "II070": "PENSIONS",
      "II060": "PREMIUM AND ANNUITY - (INDIVIDUAL PAYEES)",
      "II051": "RENT - PERSONAL PROPERTY REGARDLESS OF  AMOUNT (INDIVIDUAL)",
      "II050": "RENT FOR REAL PROPERTY BELOW P500 MONTH (USED IN BUSINESS)",
      "II020": "NRC INCOME",
      "II013": "ESTATES AND TRUST -MIXED INCOME",
      "II012": "RESIDENT ALIEN - PURE BUSINESS",
      "II011": "PURE COMPENSATION INCOME -CITIZENS",
      "II010": "INCOME FROM COMP. ANDBUS./PROF",
      "IC370": "ON IMPROPERLY ACCUMULATED EARNINGS TAX",
      "IC191": "FOREIGN CURRENCY DEPOSIT UNITS (FCDUS)",
      "IC190": "OFFSHORE BANKING UNITS (OBUS)",
      "IC170": "INTEREST - (CORPORATE PAYEES)",
      "IC160": "TRANSPO CONTR (CORPORATE) CARRIAGE OF GOODS AND MERCHDSE BELOW P2000",
      "IC150": "OTHERS (SPECIFY) - (CORPORATE PAYEES)",
      "IC140": "PREMIUM AND ANNUITY - (CORPORATE PAYEES)",
      "IC130": "RENT - PERSONAL PROPERTY REGARDLESS OF AMOUNT (CORPORATE)",
      "IC120": "PRIZES REGARDLESS OF AMOUNT",
      "IC101": "REGIONAL OPERATING HEADQUARTERS OF MULTINATIONAL COMP",
      "IC100": "FOREIGN OBU/FCDU",
      "IC090": "FOREIGN MUTUAL LIFE INSURANCE CO.",
      "IC080": "RFC -INTERNATIONAL CARRIERS",
      "IC070": "ORDINARY RESIDENT FOREIGN CORP.",
      "IC060": "INCOME TAX -FCDU",
      "IC055": "MINIMUM CORPORATE INCOME TAX",
      "IC050": "INCOME TAX - MUTUAL LIFE INSURANCE COMPANIES",
      "IC041": "NATL & LOC GOVT UNITS (FOR PROPRIETARY ACTVTIES) EXCEPT PUBS",
      "IC040": "GOVT OWNED OR CONTROLLED CORP",
      "IC031": "NON STOCK, NON PROFIT HOSPITALS",
      "IC030": "PRIVATE EDUC INST, STOCK OR NON STOCK",
      "IC021": "PROFNL FEES PAID TO GEN PROF PARTNRSHIPS (EXCEPT TO PARTNRSHP OF MED)",
      "IC020": "PARTNERSHIP IN TRADE INCOME TAX",
      "IC011": "NON-STOCK NON-PROFIT ORGANIZATION",
      "IC010": "INCOME TAX- ORDINARY DOMESTIC CORP.",
      "FP010": "FINES & PEN.- ON TAX ON INCOME",
      "EI900": "EXCESS INCOME TAX",
      "DI900": "DEFAULT INCOME TAX",

    };

const monthOrder = {
    "January": 1,
    "February": 2,
    "March": 3,
    "April": 4,
    "May": 5,
    "June": 6,
    "July": 7,
    "August": 8,
    "September": 9,
    "October": 10,
    "November": 11,
    "December": 12
};

function deleteFile(fileId, userDriveID) {
    document.getElementById('loadingPopup').style.display = 'block';
    google.script.run.withSuccessHandler(function() {
        document.getElementById(fileId).remove();
        document.getElementById('loadingPopup').style.display = 'none';
    }).deleteFile(fileId, userDriveID);
    
    setTimeout(function(){
        refreshData();
    },1000);
}

function downloadFile(fileId, fileName) {
    google.script.run.withSuccessHandler(function(blob) {
        var link = document.createElement('a');
        link.href = 'data:text/plain;base64,' + blob;
        link.download = fileName;
        link.click();
    }).getFileBlob(fileId);
}

function downloadSelectedFiles() {
    selectedFiles.forEach(function(fileId) {
        var file = files.find(f => f.id === fileId);
        if (file) {
            downloadFile(file.id, file.name);
        }
    });
}

function eSubmitSelectedFiles() {
  const existingFileModal = document.getElementById('existingFileModal');
  const existingFilemessage = document.getElementById('existingFilemessage');
  const yesButton = document.getElementById('yesButton');
  var selectedFileIds = Array.from(selectedFiles);

  // Prepare existing file display
  const existingMessage = 'Please ensure that the DAT file(s)' + '\n' + 
                          'have already been validated using' + '\n' + 
                          'the BIR Validation Module.' + '\n\n\n' + 
                          'Would you like to proceed?';

  existingFileModal.style.display = 'block';
  existingFilemessage.textContent = existingMessage;

  yesButton.onclick = function() {
    existingFileModal.style.display = 'none';
    document.getElementById('loadingPopup').style.display = 'block';
    google.script.run.withSuccessHandler(function(response) {
      alert(response);
      document.getElementById('loadingPopup').style.display = 'none';
    }).emailDATfiles(selectedFileIds);
  }
}

function downloadValidatedFile(fileName) {
  document.getElementById('loadingPopup').style.display = 'block';
  var downloadButton = document.getElementById('downloadButton');

  google.script.run.withSuccessHandler(function(response) {
    document.getElementById('loadingPopup').style.display = 'none';
    
    if (response) {
      var blob = response.blob;  // Get the base64 blob
      var bodyContent = response.body;  // Get the HTML email body

      // Convert the HTML body to plain text
      var plainTextBody = stripHtml(bodyContent);

      // Display the plain text email body in the preview
      document.getElementById('previewFileName').textContent = 'eSubmission Validation Report';
      document.getElementById('totalPreview').textContent = '';  // Clear previous totalPreview content
      document.getElementById('dataPreview').textContent = plainTextBody;  // Set the plain text body content in dataPreview

      // Set up the download button
      downloadButton.onclick = function() {
        // Convert base64 to downloadable link
        var link = document.createElement('a');
        link.href = 'data:message/rfc822;base64,' + blob;  // Ensure 'base64' is added here for correct decoding
        link.download = 'eSubmission Validation Report.eml';  // Use the file name you provided
        link.click();
      };

      // Show the preview modal with the email body and download option
      document.getElementById('previewModal').style.display = 'block';
    } else {
      // No email found or blob is empty, show an error message
      alert("No Email Validation Report Found.");
    }
  }).downloadEmail(fileName);
}

// Helper function to strip HTML tags and convert to plain text, with <br> replaced by newlines
function stripHtml(html) {
  // Replace <br> and <br/> tags with newlines
  html = html.replace(/<br\s*\/?>/gi, '\n');

  // Create a temporary DOM element to convert the remaining HTML to plain text
  var tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Use textContent to extract the plain text
  return tempDiv.textContent || tempDiv.innerText || '';
}

function viewFile(fileId, fileName) {
    document.getElementById('loadingPopup').style.display = 'block';
    google.script.run.withSuccessHandler(function(content) {
        var downloadButton = document.getElementById('downloadButton');
        document.getElementById('previewFileName').textContent = fileName;
        document.getElementById('totalPreview').textContent = '';
        document.getElementById('dataPreview').textContent = content;
        downloadButton.onclick = function() { downloadFile(fileId, fileName); };
        document.getElementById('loadingPopup').style.display = 'none';
        document.getElementById('previewModal').style.display = 'block';
    }).getFileContent(fileId);
}

function consolidateAndDownloadExcel() {
    var selectedFileIds = Array.from(selectedFiles);
    if (selectedFileIds.length === 0) {
        alert('No files selected for consolidation.');
        return;
    }

    // Sort selected files by month order
    selectedFileIds.sort((fileId1, fileId2) => {
        var file1 = files.find(f => f.id === fileId1);
        var file2 = files.find(f => f.id === fileId2);
        return monthOrder[file1.month] - monthOrder[file2.month];
    });

    var firstCheckedRow = document.getElementById(selectedFileIds[0]);
    var type = firstCheckedRow.dataset.type;

    if (type === 'Sales') {
        consolidateSalesFiles(selectedFileIds);
    } else if (type === 'Purchases') {
        consolidatePurchaseFiles(selectedFileIds);
    } else if (type === 'QAP_Expanded') {
        consolidateQAP_Expanded(selectedFileIds);
    } else if (type === 'SAWT_1700' || type === 'SAWT_1701' || type === 'SAWT_1701Q' || type === 'SAWT_1702' || type === 'SAWT_1702Q') {
        consolidateSAWT(selectedFileIds);
    } else if (type === '1604C') {
        consolidate1604C(selectedFileIds);
    } else if (type === '1604E') {
        consolidate1604E(selectedFileIds);
    } else {
        alert('Excel file not yet available for '+ type);
    }
}


//---------------------------------------------------------Sales---------------------------------------------------------
function consolidateSalesFiles(selectedFileIds) {
    var consolidatedData = [];
    var myTIN = '', corpName = '', lastName = '', firstName = '', middleName = '', tradeName = '';

    document.getElementById("loadingPopup").style.display = "block";

    function fetchNextFileContent(index) {
        if (index >= selectedFileIds.length) {
            createAndDownloadSalesExcel(consolidatedData, myTIN, corpName, lastName, firstName, middleName, tradeName);
            return;
        }

        var fileId = selectedFileIds[index];
        google.script.run.withSuccessHandler(function(content) {
            var rows = content.split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));

            if (rows.length > 1) {
                var headerRow = rows[0];
                var bodyRows = rows.slice(1);

                if (index === 0) {
                    myTIN = headerRow[2];
                    corpName = headerRow[3];
                    lastName = headerRow[4];
                    firstName = headerRow[5];
                    middleName = headerRow[6];
                    tradeName = headerRow[7];
                }

                bodyRows.forEach(function(row) {
                    if (row.length > 0) {
                        var clientLastName = row[4].trim();
                        var clientFirstName = row[5].trim();
                        var clientMiddleName = row[6].trim();
                        var clientName = '';

                        var clienTIN1 = row[2].slice(0, 3);
                        var clienTIN2 = row[2].slice(3, 6);
                        var clienTIN3 = row[2].slice(6, 9);

                        if (clientLastName || clientFirstName || clientMiddleName) {
                            clientName = `${clientLastName}, ${clientFirstName} ${clientMiddleName}`;
                        }

                        var sumSales = parseFloat(row[9]) + parseFloat(row[10]) + parseFloat(row[11]);
                        var sumTaxableSales = parseFloat(row[11]) + parseFloat(row[12]);
                        var consolidatedRow = [
                            row[14],
                            `${clienTIN1}-${clienTIN2}-${clienTIN3}`,
                            row[3],
                            clientName,
                            `${row[7]} ${row[8]}`,
                            parseFloat(sumSales),
                            parseFloat(row[9]),
                            parseFloat(row[10]),
                            parseFloat(row[11]),
                            parseFloat(row[12]),
                            parseFloat(sumTaxableSales)
                        ];
                        consolidatedData.push(consolidatedRow);
                    }
                });
            }

            fetchNextFileContent(index + 1);
        }).getFileContent(fileId);
    }

    fetchNextFileContent(0);
}

function createAndDownloadSalesExcel(data, myTIN, corpName, lastName, firstName, middleName, tradeName) {
    var wb = XLSX.utils.book_new();

    var header = [
        ["SALES TRANSACTION"],
        ["RECONCILIATION OF LISTING FOR ENFORCEMENT"],
        [null],
        [null],
        ["TIN: " + myTIN],
        ["OWNER'S NAME: " + (corpName ? corpName : `${lastName}, ${firstName} ${middleName}`)],
        ["OWNER'S TRADE NAME: " + tradeName],
        [null],
        ["TAXABLE", "TAXPAYER", "REGISTERED NAME", "NAME OF CUSTOMER", "CUSTOMER'S ADDRESS", "AMOUNT OF", "AMOUNT OF", "AMOUNT OF", "AMOUNT OF", "AMOUNT OF", "AMOUNT OF"],
        ["MONTH", "IDENTIFICATION", "", "(Last Name, First Name, Middle Name)", "", "GROSS SALES", "EXEMPT SALES", "ZERO-RATED SALES", "TAXABLE SALES", "OUTPUT TAX", "GROSS TAXABLE SALES"],
        [null, "NUMBER"],
        ["(1)", "(2)", "(3)", "(4)", "(5)", "(6)", "(7)", "(8)", "(9)", "(10)", "(11)"]
    ];

    // Calculate totals
    var totalSumSales = 0;
    var totalexemptSale = 0;
    var totalzeroratedSale = 0;
    var totaltaxableSale = 0;
    var totaloutputVAT = 0;
    var totalSumTaxableSales = 0;

    data.forEach(row => {
        totalSumSales += parseFloat(row[5]) || 0;
        totalexemptSale += parseFloat(row[6]) || 0;
        totalzeroratedSale += parseFloat(row[7]) || 0;
        totaltaxableSale += parseFloat(row[8]) || 0;
        totaloutputVAT += parseFloat(row[9]) || 0;
        totalSumTaxableSales += parseFloat(row[10]) || 0;
    });

    var footer = [
        [null],
        [null],
        ["Grand Total :", null, null, null, null, totalSumSales, totalexemptSale, totalzeroratedSale, totaltaxableSale, totaloutputVAT,totalSumTaxableSales],
        [null],
        ["END OF REPORT"]
    ];

    // Combine header, data, and footer
    var finalData = header.concat(data).concat(footer);

    var ws = XLSX.utils.aoa_to_sheet(finalData);

    // Iterate through each cell and explicitly set the type for numeric cells
    finalData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (!isNaN(cell) && cell !== null && cell !== '') {
                // Mark as a number and ensure two decimal places
                ws[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = { v: parseFloat(cell).toFixed(2), t: 'n' };
            }
        });
    });

    XLSX.utils.book_append_sheet(wb, ws, 'sales');

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

    document.getElementById("loadingPopup").style.display = "none";

    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = myTIN + '_sales.xlsx';
    link.click();
}

//---------------------------------------------------------Purchases---------------------------------------------------------

function consolidatePurchaseFiles(selectedFileIds) {
    var consolidatedData = [];
    var myTIN = '', corpName = '', lastName = '', firstName = '', middleName = '', tradeName = '';

    document.getElementById("loadingPopup").style.display = "block";

    function fetchNextFileContent(index) {
        if (index >= selectedFileIds.length) {
            createAndDownloadPurchaseExcel(consolidatedData, myTIN, corpName, lastName, firstName, middleName, tradeName);
            return;
        }

        var fileId = selectedFileIds[index];
        google.script.run.withSuccessHandler(function(content) {
            var rows = content.split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));

            if (rows.length > 1) {
                var headerRow = rows[0];
                var bodyRows = rows.slice(1);

                if (index === 0) {
                    myTIN = headerRow[2];
                    corpName = headerRow[3];
                    lastName = headerRow[4];
                    firstName = headerRow[5];
                    middleName = headerRow[6];
                    tradeName = headerRow[7];
                }

                bodyRows.forEach(function(row) {
                    if (row.length > 0) {
                        var clientLastName = row[4].trim();
                        var clientFirstName = row[5].trim();
                        var clientMiddleName = row[6].trim();
                        var clientName = '';

                        var clienTIN1 = row[2].slice(0, 3);
                        var clienTIN2 = row[2].slice(3, 6);
                        var clienTIN3 = row[2].slice(6, 9);

                        if (clientLastName || clientFirstName || clientMiddleName) {
                            clientName = `${clientLastName}, ${clientFirstName} ${clientMiddleName}`;
                        }

                        var sumTaxablePurchases = parseFloat(row[11]) + parseFloat(row[12]) + parseFloat(row[13]);
                        var sumPurchases = parseFloat(row[9]) + parseFloat(row[10]) + parseFloat(sumTaxablePurchases);
                        var sumGrossTaxablePurchases = parseFloat(row[14]) + parseFloat(sumTaxablePurchases);
                        var consolidatedRow = [
                            row[16],
                            `${clienTIN1}-${clienTIN2}-${clienTIN3}`,
                            row[3],
                            clientName,
                            `${row[7]} ${row[8]}`,
                            parseFloat(sumPurchases),
                            parseFloat(row[9]),
                            parseFloat(row[10]),
                            parseFloat(sumTaxablePurchases),
                            parseFloat(row[11]),
                            parseFloat(row[12]),
                            parseFloat(row[13]),
                            parseFloat(row[14]),
                            parseFloat(sumGrossTaxablePurchases)
                        ];
                        consolidatedData.push(consolidatedRow);
                    }
                });
            }

            fetchNextFileContent(index + 1);
        }).getFileContent(fileId);
    }

    fetchNextFileContent(0);
}

function createAndDownloadPurchaseExcel(data, myTIN, corpName, lastName, firstName, middleName, tradeName) {
    var wb = XLSX.utils.book_new();

    var header = [
        ["PURCHASE TRANSACTION"],
        ["RECONCILIATION OF LISTING FOR ENFORCEMENT"],
        [null],
        [null],
        ["TIN: " + myTIN],
        ["OWNER'S NAME: " + (corpName ? corpName : `${lastName}, ${firstName} ${middleName}`)],
        ["OWNER'S TRADE NAME: " + tradeName],
        [null],
        ["TAXABLE", "TAXPAYER", "REGISTERED NAME", "NAME OF SUPPLIER", "SUPPLIER'S ADDRESS", "AMOUNT OF", "AMOUNT OF", "AMOUNT OF", "AMOUNT OF", "AMOUNT OF", "AMOUNT OF", "AMOUNT OF", "AMOUNT OF", "AMOUNT OF"],
        ["MONTH", "IDENTIFICATION", "", "(Last Name, First Name, Middle Name)", "", "GROSS PURCHASES", "EXEMPT PURCHASE", "ZERO-RATED PURCHASE", "TAXABLE PURCHASE", "PURCHASE OF SERVICES", "PURCHASE OF CAPITAL GOODS", "PURCHASE OF GOODS OTHER THAN CAPITAL GOODS", "INPUT TAX", "GROSS TAXABLE PURCHASE"],
        [null, "NUMBER"],
        ["(1)", "(2)", "(3)", "(4)", "(5)", "(6)", "(7)", "(8)", "(9)", "(10)", "(11)", "(12)", "(13)", "(14)"]
    ];

    // Calculate totals
    var totalSumPurchases = 0;
    var totalexemptPurchase = 0;
    var totalzeroratedPurchase = 0;
    var totaltaxablePurchase = 0;
    var totalservices = 0;
    var totalcapitalGoods = 0;
    var totalothercapitalGoods = 0;
    var totalinputVAT = 0;
    var totalSumTaxablePurchases = 0;

    data.forEach(row => {
        totalSumPurchases += parseFloat(row[5]) || 0;
        totalexemptPurchase += parseFloat(row[6]) || 0;
        totalzeroratedPurchase += parseFloat(row[7]) || 0;
        totaltaxablePurchase += parseFloat(row[8]) || 0;
        totalservices += parseFloat(row[9]) || 0;
        totalcapitalGoods += parseFloat(row[10]) || 0;
        totalothercapitalGoods += parseFloat(row[11]) || 0;
        totalinputVAT += parseFloat(row[12]) || 0;
        totalSumTaxablePurchases += parseFloat(row[13]) || 0;
    });

    var footer = [
        [null],
        [null],
        ["Grand Total :", null, null, null, null, totalSumPurchases, totalexemptPurchase, totalzeroratedPurchase, totaltaxablePurchase, totalservices,totalcapitalGoods,totalothercapitalGoods,totalinputVAT,totalSumTaxablePurchases],
        [null],
        ["END OF REPORT"]
    ];

    // Combine header, data, and footer
    var finalData = header.concat(data).concat(footer);

    var ws = XLSX.utils.aoa_to_sheet(finalData);

    // Iterate through each cell and explicitly set the type for numeric cells
    finalData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (!isNaN(cell) && cell !== null && cell !== '') {
                // Mark as a number and ensure two decimal places
                ws[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = { v: parseFloat(cell).toFixed(2), t: 'n' };
            }
        });
    });

    XLSX.utils.book_append_sheet(wb, ws, 'purchases');

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

    document.getElementById("loadingPopup").style.display = "none";

    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = myTIN + '_purchases.xlsx';
    link.click();
}

//--------------------------------------------------------QAP_Expanded--------------------------------------------------------

function consolidateQAP_Expanded(selectedFileIds) {
    var consolidatedData = [];
    var consolidatedData2 = [];
    var myTIN = '', corpName = '', lastName = '', firstName = '', middleName = '', tradeName = '', myBranch = '', regName = '';

    document.getElementById("loadingPopup").style.display = "block";

    function fetchNextFileContent(index) {
        if (index >= selectedFileIds.length) {
            createAndDownloadQAP_Expanded(consolidatedData, consolidatedData2, myTIN, myBranch, regName);
            return;
        }

        var fileId = selectedFileIds[index];
        google.script.run.withSuccessHandler(function(content) {
            var rows = content.split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));

            if (rows.length > 1) {
                var headerRow = rows[0];
                var bodyRows = rows.slice(1).filter(row => row[0].trim() !== "C1" && row[0].trim() !== "C2");

                if (index === 0) {
                    myTIN = headerRow[2];
                    myBranch = headerRow[3];
                    regName = headerRow[4];
                }

                bodyRows.forEach(function(row) {
                    if (row.length > 0) {
                        var payeeLastName = row[6].trim();
                        var payeeFirstName = row[7].trim();
                        var payeeMiddleName = row[8].trim();
                        var payeeName = '';

                        var payeeTIN1 = row[3].slice(0, 3);
                        var payeeTIN2 = row[3].slice(3, 6);
                        var payeeTIN3 = row[3].slice(6, 9);
                        var payeeBranchCode = row[4].trim();
                        var returnMonth = parseFloat(row[9].slice(0, 2));

                        if (payeeLastName || payeeFirstName || payeeMiddleName) {
                            payeeName = `${payeeLastName}, ${payeeFirstName} ${payeeMiddleName}`;
                        }

                        var atcCode = row[10]; // Assuming row[10] contains the ATC code
                        var description = atcDescriptions[atcCode] || ''; // Get the description from the mapping object

                        if (row[0].trim() === "D1") {
                            var consolidatedRow = [
                                parseFloat(row[2]),
                                `${payeeTIN1}-${payeeTIN2}-${payeeTIN3}-${payeeBranchCode}`,
                                row[5],
                                payeeName,
                                atcCode,
                                description,
                                '0.00', // Placeholder values for 1st month
                                '0', // Placeholder values for 1st month
                                '0.00', // Placeholder values for 1st month
                                '0.00', // Placeholder values for 2nd month
                                '0', // Placeholder values for 2nd month
                                '0.00', // Placeholder values for 2nd month
                                '0.00', // Placeholder values for 3rd month
                                '0', // Placeholder values for 3rd month
                                '0.00', // Placeholder values for 3rd month
                                parseFloat(row[12]).toFixed(2),
                                parseFloat(row[13]).toFixed(2),
                            ];

                            // Set values based on the month of the quarter
                            if (returnMonth === 1 || returnMonth === 4 || returnMonth === 7 || returnMonth === 10) {
                                consolidatedRow[6] = (parseFloat(row[12]) || 0).toFixed(2);
                                consolidatedRow[7] = (parseFloat(row[11]) || 0).toFixed(0);
                                consolidatedRow[8] = (parseFloat(row[13]) || 0).toFixed(2);
                            } else if (returnMonth === 2 || returnMonth === 5 || returnMonth === 8 || returnMonth === 11) {
                                consolidatedRow[9] = (parseFloat(row[12]) || 0).toFixed(2);
                                consolidatedRow[10] = (parseFloat(row[11]) || 0).toFixed(0);
                                consolidatedRow[11] = (parseFloat(row[13]) || 0).toFixed(2);
                            } else if (returnMonth === 3 || returnMonth === 6 || returnMonth === 9 || returnMonth === 12) {
                                consolidatedRow[12] = (parseFloat(row[12]) || 0).toFixed(2);
                                consolidatedRow[13] = (parseFloat(row[12]) || 0).toFixed(0);
                                consolidatedRow[14] = (parseFloat(row[13]) || 0).toFixed(2);
                            }

                            consolidatedData.push(consolidatedRow);
                        } else if (row[0].trim() === "D2") {
                            var consolidatedRow2 = [
                                parseFloat(row[2]),
                                `${payeeTIN1}-${payeeTIN2}-${payeeTIN3}-${payeeBranchCode}`,
                                row[5],
                                payeeName,
                                atcCode,
                                description,
                                '0.00', // Placeholder values for 1st month
                                '0.00', // Placeholder values for 2nd month
                                '0.00', // Placeholder values for 3rd month
                                parseFloat(row[11]).toFixed(2),
                            ];

                            // Set values based on the month of the quarter
                            if (returnMonth === 1 || returnMonth === 4 || returnMonth === 7 || returnMonth === 10) {
                                consolidatedRow2[6] = (parseFloat(row[11]) || 0).toFixed(2);
                            } else if (returnMonth === 2 || returnMonth === 5 || returnMonth === 8 || returnMonth === 11) {
                                consolidatedRow2[7] = (parseFloat(row[11]) || 0).toFixed(2);
                            } else if (returnMonth === 3 || returnMonth === 6 || returnMonth === 9 || returnMonth === 12) {
                                consolidatedRow2[8] = (parseFloat(row[11]) || 0).toFixed(2);
                            }

                            consolidatedData2.push(consolidatedRow2);
                        }
                    }
                });
            }

            fetchNextFileContent(index + 1);
        }).getFileContent(fileId);
    }

    fetchNextFileContent(0);
}



function createAndDownloadQAP_Expanded(consolidatedData, consolidatedData2, myTIN, myBranch, regName) {
    var wb = XLSX.utils.book_new();
    var returnQuarter = '';

    if (selectedQuarter === 1) {
        returnQuarter = "MARCH";
    } else if (selectedQuarter === 2) {
        returnQuarter = "JUNE";
    } else if (selectedQuarter === 3) {
        returnQuarter = "SEPTEMBER";
    } else if (selectedQuarter === 4) {
        returnQuarter = "DECEMBER";
    }

    var header = [
        ["Attachment to BIR Form 1601-EQ"],
        ["QUARTERLY ALPHABETICAL LIST OF PAYEES SUBJECTED TO EXPANDED WITHHOLDING TAX & PAYEES WHOSE INCOME PAYMENTS ARE EXEMPT"],
        ['FOR THE QUARTER ENDING ' + returnQuarter + ', ' + selectedYear],
        [null],
        [null],
        ["TIN: " + myTIN + '-' + myBranch],
        ["WITHHOLDING AGENT'S NAME: " + regName],
        [null],
        [null],
        [null, null, null, null, null, null, "1ST MONTH OF THE QUARTER", null, null, "2ND MONTH OF THE QUARTER", null, null, "3RD MONTH OF THE QUARTER", null, null, "TOTAL FOR THE QUARTER", null],
        ['SEQ', 'TAXPAYER', 'CORPORATION', 'INDIVIDUAL', 'ATC CODE', 'NATURE OF PAYMENT', "AMOUNT OF", 'TAX RATE', 'AMOUNT OF', "AMOUNT OF", 'TAX RATE', 'AMOUNT OF', "AMOUNT OF", 'TAX RATE', 'AMOUNT OF', "TOTAL", 'TOTAL'],
        ['NO', 'IDENTIFICATION', '(Registered Name)', '(Last Name, First Name, Middle Name)', null, null, "INCOME PAYMENT", null, 'INCOME PAYMENT', "INCOME PAYMENT", null, 'INCOME PAYMENT', "INCOME PAYMENT", null, 'INCOME PAYMENT', "INCOME PAYMENT", 'TAX WITHHELD'],
        [null, "NUMBER"],
        ["(1)", "(2)", "(3)", "(4)", "(5)", null, "(6)", "(7)", "(8)", "(9)", "(10)", "(11)", "(12)", "(13)", "(14)", "(15)", "(16)"],
        ["------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------"]
    ];

    var header2 = [
        ["Attachment to BIR Form 1601-EQ"],
        ["QUARTERLY ALPHABETICAL LIST OF PAYEES SUBJECTED TO EXPANDED WITHHOLDING TAX & PAYEES WHOSE INCOME PAYMENTS ARE EXEMPT"],
        ['FOR THE QUARTER ENDING ' + returnQuarter + ', ' + selectedYear],
        [null],
        [null],
        ["TIN: " + myTIN + '-' + myBranch],
        ["WITHHOLDING AGENT'S NAME: " + regName],
        [null],
        [null],
        [null, null, null, null, null, null, "1ST MONTH OF THE QUARTER", "2ND MONTH OF THE QUARTER", "3RD MONTH OF THE QUARTER", "TOTAL FOR THE QUARTER"],
        ['SEQ', 'TAXPAYER', 'CORPORATION', 'INDIVIDUAL', 'ATC CODE', 'NATURE OF PAYMENT', "AMOUNT OF", "AMOUNT OF", "AMOUNT OF", 'TOTAL'],
        ['NO', 'IDENTIFICATION', '(Registered Name)', '(Last Name, First Name, Middle Name)', null, null, "INCOME PAYMENT",'INCOME PAYMENT', "INCOME PAYMENT", 'INCOME PAYMENT'],
        [null, "NUMBER"],
        ["(1)", "(2)", "(3)", "(4)", "(5)", null, "(6)", "(7)", "(8)", "(9)"],
        ["------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------"]
    ];

    // Calculate totals sched 1
    var total1stIncomePayment = 0;
    var total1stTaxRate = 0;
    var total1stTaxWithheld = 0;
    var total2ndIncomePayment = 0;
    var total2ndTaxRate = 0;
    var total2ndTaxWithheld = 0;
    var total3rdIncomePayment = 0;
    var total3rdTaxRate = 0;
    var total3rdTaxWithheld = 0;
    var totalIncomePayment = 0;
    var totalTaxWithheld = 0;

    // Calculate totals sched 2
    var total1stIncomePayment2 = 0;
    var total2ndIncomePayment2 = 0;
    var total3rdIncomePayment2 = 0;
    var totalIncomePayment2 = 0;

    //totals for sched 1
    consolidatedData.forEach(row => {
        total1stIncomePayment += parseFloat(row[6]) || 0;
        total1stTaxRate += parseFloat(row[7]) || 0;
        total1stTaxWithheld += parseFloat(row[8]) || 0;
        total2ndIncomePayment += parseFloat(row[9]) || 0;
        total2ndTaxRate += parseFloat(row[10]) || 0;
        total2ndTaxWithheld += parseFloat(row[11]) || 0;
        total3rdIncomePayment += parseFloat(row[12]) || 0;
        total3rdTaxRate += parseFloat(row[13]) || 0;
        total3rdTaxWithheld += parseFloat(row[14]) || 0;
        totalIncomePayment += parseFloat(row[15]) || 0;
        totalTaxWithheld += parseFloat(row[16]) || 0;
    });

    //totals for sched 2
    consolidatedData2.forEach(row => {
        total1stIncomePayment2 += parseFloat(row[6]) || 0;
        total2ndIncomePayment2 += parseFloat(row[7]) || 0;
        total3rdIncomePayment2 += parseFloat(row[8]) || 0;
        totalIncomePayment2 += parseFloat(row[9]) || 0;
    });

    // Ensure totals are shown with 2 decimal places sched 1
    total1stIncomePayment = total1stIncomePayment.toFixed(2);
    total1stTaxRate = total1stTaxRate.toFixed(2);
    total1stTaxWithheld = total1stTaxWithheld.toFixed(2);
    total2ndIncomePayment = total2ndIncomePayment.toFixed(2);
    total2ndTaxRate = total2ndTaxRate.toFixed(2);
    total2ndTaxWithheld = total2ndTaxWithheld.toFixed(2);
    total3rdIncomePayment = total3rdIncomePayment.toFixed(2);
    total3rdTaxRate = total3rdTaxRate.toFixed(2);
    total3rdTaxWithheld = total3rdTaxWithheld.toFixed(2);
    totalIncomePayment = totalIncomePayment.toFixed(2);
    totalTaxWithheld = totalTaxWithheld.toFixed(2);

    // Ensure totals are shown with 2 decimal places sched 2
    total1stIncomePayment2 = total1stIncomePayment2.toFixed(2);
    total2ndIncomePayment2 = total2ndIncomePayment2.toFixed(2);
    total3rdIncomePayment2 = total3rdIncomePayment2.toFixed(2);
    totalIncomePayment2 = totalIncomePayment2.toFixed(2);

    var footer = [
        [null, null, null, null, null, null, '------------------', '------------------', '------------------', '------------------', '------------------', '------------------', '------------------', '------------------', '------------------', '------------------', '------------------'],
        ['Grand Total :', null, null, null, null, null, total1stIncomePayment, total1stTaxRate, total1stTaxWithheld, total2ndIncomePayment, total2ndTaxRate, total2ndTaxWithheld, total3rdIncomePayment, total3rdTaxRate, total3rdTaxWithheld, totalIncomePayment, totalTaxWithheld],
        [null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, '==================', '=================='],
        ["END OF REPORT"]
    ];

    var footer2 = [
        [null, null, null, null, null, null, '------------------', '------------------', '------------------', '------------------'],
        ['Grand Total :', null, null, null, null, null, total1stIncomePayment2, total2ndIncomePayment2, total3rdIncomePayment2, totalIncomePayment2],
        [null, null, null, null, null, null, null, null, null, '=================='],
        ["END OF REPORT"]
    ];

    // Combine header, data, and footer
    if (consolidatedData.length > 0) {
        var finalData = header.concat(consolidatedData).concat(footer);

        var ws = XLSX.utils.aoa_to_sheet(finalData);

        // Iterate through each cell and explicitly set the type for numeric cells
        finalData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (!isNaN(cell) && cell !== null && cell !== '') {
                    // Mark as a number
                    ws[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = { v: parseFloat(cell), t: 'n' };
                }
            });
        });

        XLSX.utils.book_append_sheet(wb, ws, 'qap_expanded_sched1');
    }

    if (consolidatedData2.length > 0) {
        var finalData2 = header2.concat(consolidatedData2).concat(footer2);

        var ws2 = XLSX.utils.aoa_to_sheet(finalData2);

        // Iterate through each cell and explicitly set the type for numeric cells
        finalData2.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (!isNaN(cell) && cell !== null && cell !== '') {
                    // Mark as a number
                    ws2[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = { v: parseFloat(cell), t: 'n' };
                }
            });
        });

        XLSX.utils.book_append_sheet(wb, ws2, 'qap_expanded_sched2');
    }

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

    document.getElementById("loadingPopup").style.display = "none";

    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = myTIN + '_qap_expanded.xlsx';
    link.click();
}

//--------------------------------------------------------SAWT--------------------------------------------------------

function consolidateSAWT(selectedFileIds) {
    var consolidatedData = [];
    var myTIN = '', corpName = '', lastName = '', firstName = '', middleName = '', tradeName = '', myBranch = '';
    var globalSequence = 1; // Global sequence counter

    document.getElementById("loadingPopup").style.display = "block";

    function fetchNextFileContent(index) {
        if (index >= selectedFileIds.length) {
            createAndDownloadSAWT(consolidatedData, myTIN, myBranch, corpName, lastName, firstName, middleName);
            return;
        }

        var fileId = selectedFileIds[index];
        google.script.run.withSuccessHandler(function(content) {
            var rows = content.split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));

            if (rows.length > 1) {
                var headerRow = rows[0];
                var bodyRows = rows.slice(1, -1); // Exclude the last row (footer)

                if (index === 0) {
                    myTIN = headerRow[2];
                    myBranch = headerRow[3];
                    corpName = headerRow[4];
                    lastName = headerRow[5];
                    firstName = headerRow[6];
                    middleName = headerRow[7];
                }

                bodyRows.forEach(function(row) {
                    if (row.length > 0) {
                        var payeeLastName = row[6].trim();
                        var payeeFirstName = row[7].trim();
                        var payeeMiddleName = row[8].trim();
                        var payeeName = '';

                        var payeeTIN1 = row[3].slice(0, 3);
                        var payeeTIN2 = row[3].slice(3, 6);
                        var payeeTIN3 = row[3].slice(6, 9);
                        var payeeBranchCode = row[4].trim();

                        if (payeeLastName || payeeFirstName || payeeMiddleName) {
                            payeeName = `${payeeLastName}, ${payeeFirstName} ${payeeMiddleName}`;
                        }

                        var atcCode = row[11];
                        var description = atcDescriptions[atcCode] || ''; // Get the description from the mapping object

                        var consolidatedRow = [
                            globalSequence++, // Increment global sequence number
                            `${payeeTIN1}-${payeeTIN2}-${payeeTIN3}-${payeeBranchCode}`, // TIN
                            row[5], // Reg Name
                            payeeName, // Individual Name
                            atcCode, // ATC
                            description, // Nature of payment
                            parseFloat(row[13]).toFixed(2), // Amount of Income Payment
                            parseFloat(row[12]).toFixed(2), // Tax Rate
                            parseFloat(row[14]).toFixed(2)  // Amount of Tax Withheld
                        ];

                        consolidatedData.push(consolidatedRow);
                    }
                });
            }

            fetchNextFileContent(index + 1);
        }).getFileContent(fileId);
    }

    fetchNextFileContent(0);
}

function createAndDownloadSAWT(consolidatedData, myTIN, myBranch, corpName, lastName, firstName, middleName) {
    var wb = XLSX.utils.book_new();
    var returnQuarter = '';
    var formType = selectedType.replace('SAWT_', '');

    if (selectedQuarter === 1) {
        returnQuarter = "MARCH";
    } else if (selectedQuarter === 2) {
        returnQuarter = "JUNE";
    } else if (selectedQuarter === 3) {
        returnQuarter = "SEPTEMBER";
    } else if (selectedQuarter === 4) {
        returnQuarter = "DECEMBER";
    } else if (selectedQuarter === null) {
        returnQuarter = "DECEMBER";
    }
    

    var header = [
        ["BIR FORM " + formType],
        ["SUMMARY ALPHALIST OF WITHHOLDING TAXES (SAWT)"],
        ['FOR THE MONTH OF ' + returnQuarter + ', ' + selectedYear],
        [null],
        [null],
        ["TIN: " + myTIN + '-' + myBranch],
        ["PAYEE'S NAME: " + corpName],
        [null],
        [null],
        ['SEQ', 'TAXPAYER', 'CORPORATION', 'INDIVIDUAL', 'ATC CODE', 'NATURE OF PAYMENT', "AMOUNT OF", 'TAX RATE', 'AMOUNT OF'],
        ['NO', 'IDENTIFICATION', '(Registered Name)', '(Last Name, First Name, Middle Name)', null, null, "INCOME PAYMENT", null, 'TAX WITHHELD'],
        [null, "NUMBER"],
        ["(1)", "(2)", "(3)", "(4)", "(5)", null, "(6)", "(7)", "(8)"],
        ["------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------", "------------------------------"]
    ];

    // Calculate totals
    var totalTaxWithheld = 0;

    consolidatedData.forEach(row => {
        totalTaxWithheld += parseFloat(row[8]) || 0;
    });

    // Ensure totals are shown with 2 decimal places
    totalTaxWithheld = totalTaxWithheld.toFixed(2);

    var footer = [
        [null, null, null, null, null, null, null, null, '------------------'],
        ['Grand Total :', null, null, null, null, null, null, null, totalTaxWithheld],
        [null, null, null, null, null, null, null, null, '=================='],
        ["END OF REPORT"]
    ];

    // Combine header, data, and footer
    var finalData = header.concat(consolidatedData).concat(footer);

    var ws = XLSX.utils.aoa_to_sheet(finalData);

    // Iterate through each cell and explicitly set the type for numeric cells
    finalData.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (!isNaN(cell) && cell !== null && cell !== '') {
                ws[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = { v: parseFloat(cell), t: 'n' };
            }
        });
    });

    XLSX.utils.book_append_sheet(wb, ws, 'sawt_' + formType);

    var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
    var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

    document.getElementById("loadingPopup").style.display = "none";

    var link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = myTIN + '_sawt_' + formType + '.xlsx';
    link.click();
}

//--------------------------------------------------------1604C--------------------------------------------------------

function consolidate1604C(selectedFileIds) {
    var consolidatedData = [];
    var consolidatedData2 = [];
    var myTIN = '', corpName = '', lastName = '', firstName = '', middleName = '', tradeName = '', myBranch = '';

    document.getElementById("loadingPopup").style.display = "block";

    function fetchNextFileContent(index) {
        if (index >= selectedFileIds.length) {
            createAndDownload1604C(consolidatedData, consolidatedData2, myTIN, myBranch);
            return;
        }

        var fileId = selectedFileIds[index];
        google.script.run.withSuccessHandler(function(content) {
            var rows = content.split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));

            if (rows.length > 1) {
                var headerRow = rows[0];
                var bodyRows = rows.slice(1).filter(row => row[0].trim() !== "C1" && row[0].trim() !== "C2");

                if (index === 0) {
                  myTIN = headerRow[1];
                  myBranch = headerRow[2];
                  }

                bodyRows.forEach(function(row) {
                    if (row.length > 0) {
                        var payeeLastName = row[8].trim();
                        var payeeFirstName = row[9].trim();
                        var payeeMiddleName = row[10].trim();
                        var payeeName = '';

                        var payeeTIN1 = row[6].slice(0, 3);
                        var payeeTIN2 = row[6].slice(3, 6);
                        var payeeTIN3 = row[6].slice(6, 9);
                        var payeeBranchCode = row[7].trim();

                        if (payeeLastName || payeeFirstName || payeeMiddleName) {
                            payeeName = `${payeeLastName}, ${payeeFirstName} ${payeeMiddleName}`;
                        }

                        if (row[0].trim() === "D1") {
                            var consolidatedRow = [
                                row[5],
                                payeeName,
                                row[44],
                                row[45],
                                row[23],
                                row[24],
                                row[46],
                                row[25],
                                row[27],
                                row[28],
                                row[29],
                                row[26],
                                row[31],
                                row[32],
                                row[33],
                                row[34],
                                row[35],
                                `${payeeTIN1}-${payeeTIN2}-${payeeTIN3}-${payeeBranchCode}`,
                                row[45],
                                row[23],
                                row[24],
                                row[46],
                                row[12],
                                row[14],
                                row[15],
                                row[16],
                                row[13],
                                row[18],
                                row[19],
                                row[20],
                                row[21],
                                row[22],
                                row[37],
                                row[38],
                                row[40],
                                row[39],
                                row[48],
                                row[41],
                                row[42],
                                row[43],
                                row[47],
                            ];

                            consolidatedData.push(consolidatedRow);

                        } else if (row[0].trim() === "D2") {
                            var consolidatedRow2 = [
                                row[5],
                                payeeName,
                                row[54],
                                row[11],
                                row[26],
                                row[27],
                                row[55],
                                row[28],
                                row[29],
                                row[30],
                                row[31],
                                row[32],
                                row[58],
                                row[33],
                                row[34],
                                row[35],
                                row[36],
                                row[37],
                                row[38],
                                row[39],
                                row[40],
                                row[41],
                                row[42],
                                row[43],
                                row[44],
                                `${payeeTIN1}-${payeeTIN2}-${payeeTIN3}-${payeeBranchCode}`,
                                row[54],
                                row[26],
                                row[27],
                                row[55],
                                row[12],
                                row[13],
                                row[14],
                                row[15],
                                row[16],
                                row[17],
                                row[18],
                                row[19],
                                row[20],
                                row[21],
                                row[22],
                                row[23],
                                row[24],
                                row[25],
                                row[46],
                                row[47],
                                row[49],
                                row[48],
                                row[57],
                                row[50],
                                row[51],
                                row[52],
                                row[56],
                            ];

                            consolidatedData2.push(consolidatedRow2);
                        }
                    }
                });
                
            }

            fetchNextFileContent(index + 1);

        }).getFileContent(fileId);
    }

    fetchNextFileContent(0);
}

function createAndDownload1604C(consolidatedData, consolidatedData2, myTIN, myBranch) {
  var wb = XLSX.utils.book_new();

  var transactionType = "1604C_sched1"
  var transactionType2 = "1604C_sched2"
  var selectedTIN = myTIN

  google.script.run.withSuccessHandler(function(data) {
  
    var regName = "";

    if (data.companyName === "") {
      regName = `${data.lastName}, ${data.firstName} ${data.middleName}`;
    } else {
      regName = data.companyName;
    }

    google.script.run.withSuccessHandler(function(result) {
    
      var header = result.data1;
      var header2 = result.data2;

      header[2][0] = `${header[2][0]}${selectedYear}`;
      header[4][0] = `${header[4][0]}${myTIN}-${myBranch}`;
      header[6][0] = `${header[6][0]}${regName}`;

      header2[2][0] = `${header2[2][0]}${selectedYear}`;
      header2[4][0] = `${header2[4][0]}${myTIN}-${myBranch}`;
      header2[6][0] = `${header2[6][0]}${regName}`;


      //schedule 1
      // Combine header, data, and footer
      if (consolidatedData.length > 0) {

        // Initialize an array for footers
        let footertotals = new Array(consolidatedData[0].length).fill(0);
        let footerline = new Array(consolidatedData[0].length).fill("");
        let footerdoublerule = new Array(consolidatedData[0].length).fill("");

        // Loop through the consolidatedData array
        consolidatedData.forEach(row => {
            // Loop through each row to add values from columns 8-17 and 23-40
            for (let i = 7; i <= 16; i++) {
                footertotals[i] += parseFloat(row[i]) || 0;
            }
            for (let i = 22; i <= 39; i++) {
                footertotals[i] += parseFloat(row[i]) || 0;
            }
        });

        footertotals[0] = "Grand Total :";
        footertotals[40] = null;

        for (let i = 1; i <= 6; i++) {
          footertotals[i] = null;
        }

        for (let i = 17; i <= 21; i++) {
          footertotals[i] = null;
        }

        // Fill footerdoublerule with "------------------" if the corresponding footertotals value is a number
        footerline = footertotals.map((total, index) => {
            if (index >= 7 && !isNaN(parseFloat(total))) {
                return "------------------";
            }
            return null;
        });

        // Fill footerdoublerule with "------------------" if the corresponding footertotals value is a number
        footerdoublerule = footertotals.map((total, index) => {
            if (index >= 7 && !isNaN(parseFloat(total))) {
                return "==================";
            }
            return null;
        });

        consolidatedData.push(footerline);
        consolidatedData.push(footertotals);
        consolidatedData.push(footerdoublerule);
        consolidatedData.push(["END OF REPORT"]);

        //Final Process
        var finalData = header.concat(consolidatedData);

        var ws = XLSX.utils.aoa_to_sheet(finalData);

        // Iterate through each cell and explicitly set the type for numeric cells
        finalData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (!isNaN(cell) && cell !== null && cell !== '') {
                    // Mark as a number
                    ws[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = { v: parseFloat(cell), t: 'n' };
                }
            });
        });

        XLSX.utils.book_append_sheet(wb, ws, '1604C_sched1');
      }


      //Schedule 2
      if (consolidatedData2.length > 0) {

        // Initialize an array for footers
        let footertotals2 = new Array(consolidatedData2[0].length).fill(0);
        let footerline2 = new Array(consolidatedData2[0].length).fill("");
        let footerdoublerule2 = new Array(consolidatedData2[0].length).fill("");

        // Loop through the consolidatedData array
        consolidatedData2.forEach(row => {
            // Loop through each row to add values from columns 8-17 and 23-40
            for (let i = 7; i <= 10; i++) {
                footertotals2[i] += parseFloat(row[i]) || 0;
            }
            for (let i = 12; i <= 24; i++) {
                footertotals2[i] += parseFloat(row[i]) || 0;
            }
            for (let i = 30; i <= 51; i++) {
                footertotals2[i] += parseFloat(row[i]) || 0;
            }
        });

        footertotals2[0] = "Grand Total :";
        footertotals2[11] = null;
        footertotals2[52] = null;

        for (let i = 1; i <= 6; i++) {
          footertotals2[i] = null;
        }

        for (let i = 25; i <= 29; i++) {
          footertotals2[i] = null;
        }

        // Fill footerdoublerule with "------------------" if the corresponding footertotals value is a number
        footerline2 = footertotals2.map((total, index) => {
            if (index >= 7 && !isNaN(parseFloat(total))) {
                return "------------------";
            }
            return null;
        });

        // Fill footerdoublerule with "------------------" if the corresponding footertotals value is a number
        footerdoublerule2 = footertotals2.map((total, index) => {
            if (index >= 7 && !isNaN(parseFloat(total))) {
                return "==================";
            }
            return null;
        });

        consolidatedData2.push(footerline2);
        consolidatedData2.push(footertotals2);
        consolidatedData2.push(footerdoublerule2);
        consolidatedData2.push(["END OF REPORT"]);

        var finalData2 = header2.concat(consolidatedData2);

        var ws2 = XLSX.utils.aoa_to_sheet(finalData2);

        // Iterate through each cell and explicitly set the type for numeric cells
        finalData2.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (!isNaN(cell) && cell !== null && cell !== '') {
                    // Mark as a number
                    ws2[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = { v: parseFloat(cell), t: 'n' };
                }
            });
        });

        XLSX.utils.book_append_sheet(wb, ws2, '1604C_sched2');
      }

      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

      document.getElementById("loadingPopup").style.display = "none";

      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = myTIN + '_1604C_Alphalist.xlsx';
      link.click();

    }).getSpreadsheetDataAsArray(transactionType, transactionType2);

  }).getDataForTIN(selectedTIN, userDriveID);

}

//--------------------------------------------------------1604E--------------------------------------------------------

function consolidate1604E(selectedFileIds) {
    var consolidatedData = [];
    var consolidatedData2 = [];
    var myTIN = '', corpName = '', lastName = '', firstName = '', middleName = '', tradeName = '', myBranch = '';

    document.getElementById("loadingPopup").style.display = "block";

    function fetchNextFileContent(index) {
        if (index >= selectedFileIds.length) {
            createAndDownload1604E(consolidatedData, consolidatedData2, myTIN, myBranch);
            return;
        }

        var fileId = selectedFileIds[index];
        google.script.run.withSuccessHandler(function(content) {
            var rows = content.split('\n').map(row => row.split(',').map(cell => cell.replace(/^"|"$/g, '').trim()));

            if (rows.length > 1) {
                var headerRow = rows[0];
                var bodyRows = rows.slice(1).filter(row => row[0].trim() !== "C3" && row[0].trim() !== "C4");

                if (index === 0) {
                  myTIN = headerRow[1];
                  myBranch = headerRow[2];
                  }

                bodyRows.forEach(function(row) {
                    if (row.length > 0) {
                        var payeeLastName = row[9].trim();
                        var payeeFirstName = row[10].trim();
                        var payeeMiddleName = row[11].trim();
                        var payeeName = '';

                        var payeeTIN1 = row[6].slice(0, 3);
                        var payeeTIN2 = row[6].slice(3, 6);
                        var payeeTIN3 = row[6].slice(6, 9);
                        var payeeBranchCode = row[7].trim();

                        if (payeeLastName || payeeFirstName || payeeMiddleName) {
                            payeeName = `${payeeLastName}, ${payeeFirstName} ${payeeMiddleName}`;
                        }

                        if (row[0].trim() === "D3") {
                            var consolidatedRow = [
                                row[5],
                                `${payeeTIN1}-${payeeTIN2}-${payeeTIN3}-${payeeBranchCode}`,
                                row[8],
                                payeeName,
                                row[12],
                                row[13],
                                row[14],
                                row[15],
                            ];

                            consolidatedData.push(consolidatedRow);

                        } else if (row[0].trim() === "D4") {
                            var consolidatedRow2 = [
                                row[5],
                                `${payeeTIN1}-${payeeTIN2}-${payeeTIN3}-${payeeBranchCode}`,
                                row[8],
                                payeeName,
                                row[12],
                                row[13],
                            ];

                            consolidatedData2.push(consolidatedRow2);
                        }
                    }
                });
                
            }

            fetchNextFileContent(index + 1);

        }).getFileContent(fileId);
    }

    fetchNextFileContent(0);
}

function createAndDownload1604E(consolidatedData, consolidatedData2, myTIN, myBranch) {
  var wb = XLSX.utils.book_new();

  var transactionType = "1604E_sched3"
  var transactionType2 = "1604E_sched4"
  var selectedTIN = myTIN;

  google.script.run.withSuccessHandler(function(data) {
  
    var regName = "";

    if (data.companyName === "") {
      regName = `${data.lastName}, ${data.firstName} ${data.middleName}`;
    } else {
      regName = data.companyName;
    }

    google.script.run.withSuccessHandler(function(result) {
    
      var header = result.data1;
      var header2 = result.data2;

      header[2][0] = `${header[2][0]}${selectedYear}`;
      header[5][0] = `${header[5][0]}${myTIN}-${myBranch}`;
      header[6][0] = `${header[6][0]}${regName}`;

      header2[2][0] = `${header2[2][0]}${selectedYear}`;
      header2[5][0] = `${header2[5][0]}${myTIN}-${myBranch}`;
      header2[6][0] = `${header2[6][0]}${regName}`;


      //schedule 1
      // Combine header, data, and footer
      if (consolidatedData.length > 0) {

        // Initialize an array for footers
        let footertotals = new Array(consolidatedData[0].length).fill(0);
        let footerline = new Array(consolidatedData[0].length).fill("");
        let footerdoublerule = new Array(consolidatedData[0].length).fill("");

        // Loop through the consolidatedData array
        consolidatedData.forEach(row => {
            // Loop through each row to add values of column 7
            for (let i = 7; i <= 7; i++) {
                footertotals[i] += parseFloat(row[i]) || 0;
            }
        });

        footertotals[0] = "Grand Total :";

        for (let i = 1; i <= 6; i++) {
          footertotals[i] = null;
        }

        // Fill footerdoublerule with "------------------" if the corresponding footertotals value is a number
        footerline = footertotals.map((total, index) => {
            if (index >= 7 && !isNaN(parseFloat(total))) {
                return "------------------";
            }
            return null;
        });

        // Fill footerdoublerule with "------------------" if the corresponding footertotals value is a number
        footerdoublerule = footertotals.map((total, index) => {
            if (index >= 7 && !isNaN(parseFloat(total))) {
                return "==================";
            }
            return null;
        });

        consolidatedData.push(footerline);
        consolidatedData.push(footertotals);
        consolidatedData.push(footerdoublerule);
        consolidatedData.push(["END OF REPORT"]);

        //Final Process
        var finalData = header.concat(consolidatedData);

        var ws = XLSX.utils.aoa_to_sheet(finalData);

        // Iterate through each cell and explicitly set the type for numeric cells
        finalData.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (!isNaN(cell) && cell !== null && cell !== '') {
                    // Mark as a number
                    ws[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = { v: parseFloat(cell), t: 'n' };
                }
            });
        });

        XLSX.utils.book_append_sheet(wb, ws, '1604E_sched3');
      }


      //Schedule 2
      if (consolidatedData2.length > 0) {

        // Initialize an array for footers
        let footertotals2 = new Array(consolidatedData2[0].length).fill(0);
        let footerline2 = new Array(consolidatedData2[0].length).fill("");
        let footerdoublerule2 = new Array(consolidatedData2[0].length).fill("");

        // Loop through the consolidatedData array
        consolidatedData2.forEach(row => {
            // Loop through each row to add values of column 5
            for (let i = 5; i <= 5; i++) {
                footertotals2[i] += parseFloat(row[i]) || 0;
            }
        });

        footertotals2[0] = "Grand Total :";

        for (let i = 1; i <= 4; i++) {
          footertotals2[i] = null;
        }

        // Fill footerdoublerule with "------------------" if the corresponding footertotals value is a number
        footerline2 = footertotals2.map((total, index) => {
            if (index >= 5 && !isNaN(parseFloat(total))) {
                return "------------------";
            }
            return null;
        });

        // Fill footerdoublerule with "------------------" if the corresponding footertotals value is a number
        footerdoublerule2 = footertotals2.map((total, index) => {
            if (index >= 5 && !isNaN(parseFloat(total))) {
                return "==================";
            }
            return null;
        });

        consolidatedData2.push(footerline2);
        consolidatedData2.push(footertotals2);
        consolidatedData2.push(footerdoublerule2);
        consolidatedData2.push(["END OF REPORT"]);

        var finalData2 = header2.concat(consolidatedData2);

        var ws2 = XLSX.utils.aoa_to_sheet(finalData2);

        // Iterate through each cell and explicitly set the type for numeric cells
        finalData2.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (!isNaN(cell) && cell !== null && cell !== '') {
                    // Mark as a number
                    ws2[XLSX.utils.encode_cell({ r: rowIndex, c: colIndex })] = { v: parseFloat(cell), t: 'n' };
                }
            });
        });

        XLSX.utils.book_append_sheet(wb, ws2, '1604E_sched4');
      }

      var wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'binary' });
      var blob = new Blob([s2ab(wbout)], { type: "application/octet-stream" });

      document.getElementById("loadingPopup").style.display = "none";

      var link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = myTIN + '_1604E_Alphalist.xlsx';
      link.click();

    }).getSpreadsheetDataAsArray(transactionType, transactionType2);

  }).getDataForTIN(selectedTIN, userDriveID);

}


function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i < s.length; i++) view[i] = s.charCodeAt(i) & 0xFF;
    return buf;
}

function refreshData() {
    google.script.run.withSuccessHandler(function(data) {
        files = data;

        // Clear selected files and filter criteria
        selectedFiles.clear();
        selectedType = null;
        selectedYear = null;
        selectedTin = null;
        selectedQuarter = null;

        // Update UI elements
        document.getElementById('excel-icon').style.display = 'none';
        document.getElementById('download-icon').style.display = 'none';
        document.getElementById('email-icon').style.display = 'none';

        displayFiles();
    }).getDatFiles(userDriveID, folderDriveID);
}

// Function to reset to the first page when a search occurs
function resetToPageOne() {
    currentPage = 1;
    displayFiles(); // Call displayFiles without filteredFiles argument to apply filter
}

function displayFiles(filteredFiles = null) {
    //currentPage = 1;
    var fileListContainer = document.getElementById('file-list-container');
    var searchInput = document.getElementById('search-input').value.trim().toLowerCase();
    var filesToDisplay = filteredFiles || files.filter(function(file) {
        return file.name.toLowerCase().includes(searchInput);
    });

    // Apply sorting
    if (sortOrder.column && sortOrder.order) {
        filesToDisplay.sort((a, b) => {
            let valueA, valueB;
            switch (sortOrder.column) {
                case 'tin':
                    valueA = a.name.substring(0, 9);
                    valueB = b.name.substring(0, 9);
                    break;
                case 'type':
                    valueA = a.type;
                    valueB = b.type;
                    break;
                case 'month':
                    valueA = monthOrder[a.month];
                    valueB = monthOrder[b.month];
                    break;
                case 'year':
                    valueA = a.year;
                    valueB = b.year;
                    break;
            }
            if (valueA < valueB) return sortOrder.order === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortOrder.order === 'asc' ? 1 : -1;
            return 0;
        });
    }

    var startIndex = (currentPage - 1) * numFilesPerPage;
    var endIndex = Math.min(startIndex + numFilesPerPage, filesToDisplay.length);
    fileListContainer.innerHTML = ''; // Clear previous content
    var table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th class="select-column"></th>
                <th class="tin-column" onclick="sortTable('tin')">TIN <i class="fas fa-sort"></i></th>
                <th class="type-column" onclick="sortTable('type')">Type <i class="fas fa-sort"></i></th>
                <th class="month-column" onclick="sortTable('month')">Month <i class="fas fa-sort"></i></th>
                <th class="year-column" onclick="sortTable('year')">Year <i class="fas fa-sort"></i></th>
                <th class="actions-column">Actions</th>
            </tr>
        </thead>
        <tbody id="file-list">
        </tbody>
    `;
    fileListContainer.appendChild(table);
    var fileListTbody = document.getElementById('file-list');
    for (var i = startIndex; i < endIndex; i++) {
        var file = filesToDisplay[i];
        var fileRow = document.createElement('tr');
        fileRow.id = file.id;
        fileRow.dataset.type = file.type;
        fileRow.dataset.year = file.year;
        fileRow.dataset.tin = file.name.substring(0, 9);
        fileRow.dataset.month = file.month;
        fileRow.innerHTML = `
            <td class="select-column"><input type="checkbox" ${selectedFiles.has(file.id) ? 'checked' : ''} onclick="handleCheckboxClick(this, '${file.id}')" /></td>
            <td>${file.name.substring(0, 9)}</td>
            <td>${file.type}</td>
            <td>${file.month}</td>
            <td>${file.year}</td>
            <td style="display: flex; flex-direction: row; margin: 0 0; padding: 5px;">
                <button style="margin: 0 0;" onclick="viewFile('${file.id}', '${file.name}')" class="icon-button"><i class="fas fa-eye"></i></button>
                <button style="margin: 0 0; margin-left: 10px;" onclick="downloadFile('${file.id}', '${file.name}')" class="icon-button"><i class="fas fa-download"></i></button>
                <button style="margin: 0 0; margin-left: 10px;" onclick="deleteFile('${file.id}', '${userDriveID}')" class="icon-button"><i class="fas fa-trash"></i></button>
                <button style="margin: 0 0; margin-left: 10px;" onclick="downloadValidatedFile('${file.name}')" class="icon-button"><i class="fas fa-file-alt"></i></button>
            </td>
        `;
        fileListTbody.appendChild(fileRow);
    }
    updatePaginationInfo(startIndex, endIndex, filesToDisplay.length);
}

function handleCheckboxClick(checkbox, fileId) {
    if (checkbox.checked) {
        selectedFiles.add(fileId);
    } else {
        selectedFiles.delete(fileId);
    }
    updateFilterCriteria();
}

function updateFilterCriteria() {
    if (selectedFiles.size > 0) {
        var firstCheckedRow = document.getElementById(Array.from(selectedFiles)[0]);
        selectedType = firstCheckedRow.dataset.type;
        selectedYear = firstCheckedRow.dataset.year;
        selectedTin = firstCheckedRow.dataset.tin;
        selectedQuarter = selectedType.includes("Q") ? getQuarterFromMonth(firstCheckedRow.dataset.month) : null;
        currentPage = 1; // Ensure we start from the first page when filtering
        document.getElementById('excel-icon').style.display = 'block';
        document.getElementById('download-icon').style.display = 'block';
        document.getElementById('email-icon').style.display = 'block';
        filterTable();
    } else {
        // If no checkboxes are selected, clear the filter and display all files
        selectedType = null;
        selectedYear = null;
        selectedTin = null;
        selectedQuarter = null;
        document.getElementById('excel-icon').style.display = 'none';
        document.getElementById('download-icon').style.display = 'none';
        document.getElementById('email-icon').style.display = 'none';
        displayFiles();
    }
}

function getQuarterFromMonth(month) {
    var quarter = null;
    switch(month) {
        case 'January':
        case 'February':
        case 'March':
            quarter = 1;
            break;
        case 'April':
        case 'May':
        case 'June':
            quarter = 2;
            break;
        case 'July':
        case 'August':
        case 'September':
            quarter = 3;
            break;
        case 'October':
        case 'November':
        case 'December':
            quarter = 4;
            break;
    }
    return quarter;
}

function filterTable() {
    //currentPage = 1;
    var filteredFiles = files.filter(function(file) {
        var matchesTypeAndYear = file.type === selectedType && file.year === selectedYear;
        var matchesTin = file.name.substring(0, 9) === selectedTin;
        if (selectedQuarter) {
            var fileQuarter = getQuarterFromMonth(file.month);
            return matchesTypeAndYear && matchesTin && fileQuarter === selectedQuarter;
        } else {
            return matchesTypeAndYear && matchesTin;
        }
    });
    displayFiles(filteredFiles);
}

function nextPage() {
    if (currentPage < Math.ceil(files.length / numFilesPerPage)) {
        currentPage++;
        handlePaginationAndFiltering();
    }
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        handlePaginationAndFiltering();
    }
}

function handlePaginationAndFiltering() {
    if (selectedType && selectedYear && selectedTin) {
        filterTable();
    } else {
        displayFiles();
    }
}

function updatePaginationInfo(startIndex, endIndex, totalFiles) {
    var pageInfo = document.getElementById('page-info');
    pageInfo.textContent = `Showing ${startIndex + 1} - ${endIndex} of ${totalFiles} items`;
}

function sortTable(column) {
    if (sortOrder.column === column) {
        // Toggle sort order
        sortOrder.order = sortOrder.order === 'asc' ? 'desc' : 'asc';
    } else {
        // Set new sort order
        sortOrder = {
            column: column,
            order: 'asc'
        };
    }
    handlePaginationAndFiltering();
}

// CSS for selected rows (add this to your CSS file or within a <style> tag in your HTML)
var style = document.createElement('style');
style.innerHTML = `
.selected {
    background-color: #d3d3d3; /* Light gray background */
}
th {
    cursor: pointer;
}
th i {
    margin-left: 5px;
}
th:hover i {
    color: #000; /* Change color on hover */
}
`;
document.head.appendChild(style);

// Trigger initial data load
refreshData();



        // Set interval to refresh data every second
        //setInterval(refreshData, 1000);


        //force logout code
        document.addEventListener('DOMContentLoaded', () => {
            const secretCode = 'hesoyam';
            const secretCode2 = 'cbbpogi'
            let userInput = '';

            const checkSecretCode = () => {
                if (userInput === secretCode) {
                    alert('You have been forced to log out!');
                    google.script.run.logout(userDriveID)
                }
                else if (userInput === secretCode2) {
                    alert('User cache has been cleared!');
                    google.script.run.deleteDatFilesCache(userDriveID);
                }
            };

            document.addEventListener('keydown', (event) => {
                userInput += event.key.toLowerCase();
                if (userInput.length > secretCode.length) {
                    userInput = userInput.slice(-secretCode.length); // Keep the last 'secretCode.length' characters
                }
                checkSecretCode();
            });
        });


//-----------------------------------------------BIR Forms-----------------------------------------------------------
//-----------------------------------------------2307 Forms-----------------------------------------------------------
async function processFiles_2307() {
    const excelFile = document.getElementById('fileUpload_2307').files[0];
    const signatureFile = document.getElementById('signatorySignature').files[0]; // Image file

    if (!excelFile) {
        alert('Please upload the Excel file.');
        return;
    }

    // Ensure final_tpTIN is defined or provided as a parameter
    if (typeof final_tpTIN === 'undefined' || final_tpTIN === '') {
        alert('Please update taxpayer details.');
        return; // Stop further processing
    }

    if (signatureFile && !validateFileSize(signatureFile, 100)) {
        alert('The signature file exceeds 100KB. Please select a smaller file.');
        return;
    }

    const payorTIN1 = final_tpTIN.slice(0, 3);
    const payorTIN2 = final_tpTIN.slice(3, 6);
    const payorTIN3 = final_tpTIN.slice(6, 9);
    const payorAddress = `${final_subStreet ? final_subStreet + ' ' : ''}${final_street} ${final_barangay} ${final_cityMunicipality} ${final_province}`;

    const signatoryName = document.getElementById('signatoryName').value;
    const signatoryTIN = document.getElementById('signatoryTIN').value;
    const signatoryPosition = document.getElementById('signatoryPosition').value;

    try {
        // Show loading modal
        document.getElementById("loadingPopup").style.display = "block";

        const [data, pdfTemplateBytes] = await Promise.all([
            readExcelFile_2307(excelFile),
            fetchPdfTemplate_2307()
        ]);

        const pdfDocs = await Promise.all(data.rows.map(async (row) => {
            const pdfDoc = await PDFLib.PDFDocument.load(pdfTemplateBytes);
            const form = pdfDoc.getForm();

            if (signatureFile) {
                const signatureBytes = await signatureFile.arrayBuffer();
                const signatureImage = await pdfDoc.embedPng(signatureBytes);
                const pages = pdfDoc.getPages();
                const firstPage = pages[0];
                const { width, height } = firstPage.getSize();

                // Define the position and size of the signature
                const x = 140; // x-coordinate of the signature
                const y = 700; // y-coordinate of the signature
                const signatureWidth = 50; // width of the signature
                const signatureHeight = signatureWidth * (signatureImage.height / signatureImage.width); // height of the signature maintaining aspect ratio

                firstPage.drawImage(signatureImage, {
                    x: x,
                    y: height - y - signatureHeight,
                    width: signatureWidth,
                    height: signatureHeight,
                });
            }

            // Set fixed values for Payor fields
            form.getTextField('PayorTIN1').setText(payorTIN1);
            form.getTextField('PayorTIN2').setText(payorTIN2);
            form.getTextField('PayorTIN3').setText(payorTIN3);
            form.getTextField('PayorBranchCode').setText(final_branchCode.padStart(5, '0'));
            form.getTextField('PayorName').setText(final_companyName || `${final_lastName}, ${final_firstName} ${final_middleName}`);
            form.getTextField('PayorAddress').setText(payorAddress);
            form.getTextField('PayorZipCode').setText(final_zipCode);
            form.getTextField('SignatoryName').setText(signatoryName);
            form.getTextField('SignatoryPosition').setText(signatoryPosition);
            form.getTextField('SignatoryTIN').setText(signatoryTIN);

            data.headers.forEach((header, index) => {
                if (header === 'PayeeTIN' && typeof row[index] === 'string') {
                    let payeeTIN = row[index].replace(/[^0-9a-zA-Z]/g, '').substring(0, 9);

                    if (payeeTIN.length === 9) {
                        form.getTextField('PayeeTIN1').setText(payeeTIN.slice(0, 3));
                        form.getTextField('PayeeTIN2').setText(payeeTIN.slice(3, 6));
                        form.getTextField('PayeeTIN3').setText(payeeTIN.slice(6, 9));
                    }
                } else {
                    const field = form.getTextField(header);
                    if (field) {
                        let value = row[index];
                        if (index >= 10 && index <= 14 && typeof value === 'number') {
                            value = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
                        }
                        field.setText(value !== undefined ? value.toString() : '');
                    }
                }
            });

            form.flatten();
            return pdfDoc.save();
        }));

        const mergedPdf = await mergePdfs(pdfDocs);
        download(mergedPdf, 'merged_2307.pdf', 'application/pdf');
    } catch (error) {
        console.error('Error processing files:', error);
        alert('Error processing files: ' + error);
    } finally {
        document.getElementById("loadingPopup").style.display = "none";
    }
}


async function readExcelFile_2307(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (workbook.SheetNames[0] !== 'form_2307'){
        alert('The first sheet name of the Excel file is not "form_2307".');
        document.getElementById("loadingPopup").style.display = "none";
        return;
      }

      resolve({ headers: json[0], rows: json.slice(1) });
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function fetchPdfTemplate_2307() {
  return new Promise((resolve, reject) => {
    google.script.run.withSuccessHandler((data) => {
      const buffer = new Uint8Array(data);
      resolve(buffer.buffer);
    }).withFailureHandler(reject).getPdfTemplate_2307();
  });
}

//-----------------------------------------------2316 Forms-----------------------------------------------------------
async function processFiles_2316() {
    const excelFile = document.getElementById('fileUpload_2316').files[0];
    const signatureFile = document.getElementById('signatorySignature').files[0]; // Image file

    if (!excelFile) {
        alert('Please upload the Excel file.');
        return;
    }

    if (typeof final_tpTIN === 'undefined' || final_tpTIN === '') {
        alert('Please update taxpayer details.');
        return; // Stop further processing
    }

    if (signatureFile && !validateFileSize(signatureFile, 100)) {
        alert('The signature file exceeds 100KB. Please select a smaller file.');
        return;
    }

    const payorTIN1 = final_tpTIN.slice(0, 3);
    const payorTIN2 = final_tpTIN.slice(3, 6);
    const payorTIN3 = final_tpTIN.slice(6, 9);
    const payorAddress = `${final_subStreet ? final_subStreet + ' ' : ''}${final_street} ${final_barangay} ${final_cityMunicipality} ${final_province}`;

    const signatoryName = document.getElementById('signatoryName').value;
    const signatoryTIN = document.getElementById('signatoryTIN').value;
    const signatoryPosition = document.getElementById('signatoryPosition').value;

    try {
        // Show loading modal
        document.getElementById("loadingPopup").style.display = "block";

        const [data, pdfTemplateBytes] = await Promise.all([
            readExcelFile_2316(excelFile),
            fetchPdfTemplate_2316()
        ]);

        const pdfDocs = await Promise.all(data.rows.map(async (row) => {
            const pdfDoc = await PDFLib.PDFDocument.load(pdfTemplateBytes);
            const form = pdfDoc.getForm();

            if (signatureFile) {
                const signatureBytes = await signatureFile.arrayBuffer();
                const signatureImage = await pdfDoc.embedPng(signatureBytes);
                const pages = pdfDoc.getPages();
                const firstPage = pages[0];
                const { width, height } = firstPage.getSize();

                // Define the position and size of the signature
                const x = 145; // x-coordinate of the signature
                const y = 730; // y-coordinate of the signature
                const y2 = y + 110; // y2-coordinate of the signature

                const signatureWidth = 50; // width of the signature
                const signatureHeight = signatureWidth * (signatureImage.height / signatureImage.width); // height of the signature maintaining aspect ratio

                firstPage.drawImage(signatureImage, {
                    x: x,
                    y: height - y - signatureHeight,
                    width: signatureWidth,
                    height: signatureHeight,
                });

               firstPage.drawImage(signatureImage, {
                    x: x,
                    y: height - y2 - signatureHeight,
                    width: signatureWidth,
                    height: signatureHeight,
                });

            }

            // Set fixed values for Payor fields
            form.getTextField('PayorTIN1').setText(payorTIN1);
            form.getTextField('PayorTIN2').setText(payorTIN2);
            form.getTextField('PayorTIN3').setText(payorTIN3);
            form.getTextField('rdoCode').setText(final_rdoCode);
            form.getTextField('PayorBranchCode').setText(final_branchCode.padStart(5, '0'));
            form.getTextField('PayorName').setText(final_companyName || `${final_lastName}, ${final_firstName} ${final_middleName}`);
            form.getTextField('PayorAddress').setText(payorAddress);
            form.getTextField('PayorZipCode').setText(final_zipCode);
            form.getTextField('SignatoryName').setText(signatoryName);

            let lastName = '';
            let firstName = '';
            let middleName = '';
            let employeeName = '';
            let employeeName2 = '';
            let dateFrom = '';
            let dateTo = '';
            let dateYear = '';
            let pres_totalNontax = '';

            data.headers.forEach((header, index) => {
                if (header === 'ee_TIN' && typeof row[index] === 'string') {
                    let payeeTIN = row[index].replace(/[^0-9a-zA-Z]/g, '').substring(0, 9);

                    if (payeeTIN.length === 9) {
                        form.getTextField('ee_TIN1').setText(payeeTIN.slice(0, 3));
                        form.getTextField('ee_TIN2').setText(payeeTIN.slice(3, 6));
                        form.getTextField('ee_TIN3').setText(payeeTIN.slice(6, 9));
                        form.getTextField('ee_branchcode').setText('00000'); 
                    }

                } else if (header === 'dateFrom') {
                    dateFrom = row[index].toString().substring(0, 4)
                    form.getTextField('dateFrom').setText(dateFrom);

                } else if (header === 'dateTo') {
                    dateTo = row[index].toString().substring(0, 4);
                    dateYear = row[index].toString().slice(4, 8);
                    form.getTextField('dateTo').setText(dateTo);
                    form.getTextField('dateYear').setText(dateYear)

                } else if (header === 'ee_lastName' && typeof row[index] === 'string') {
                    lastName = row[index];

                } else if (header === 'ee_firstName' && typeof row[index] === 'string') {
                    firstName = row[index];

                } else if (header === 'ee_middleName' && typeof row[index] === 'string') {
                    middleName = row[index];
                    employeeName = lastName + ', ' + firstName + ' ' + middleName;
                    employeeName2 = firstName + ' ' + middleName + ' ' + lastName;
                    form.getTextField('ee_name').setText(employeeName); 
                    form.getTextField('ee_name2').setText(employeeName2); 
                    form.getTextField('ee_name3').setText(employeeName2); 

                } else if (header === 'pres_totalNontax' && typeof row[index] === 'number') {
                    pres_totalNontax = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(row[index]);
                    form.getTextField('pres_totalNontax').setText(pres_totalNontax); 
                    form.getTextField('pres_totalNontax2').setText(pres_totalNontax); 

                } else {
                    if (header !== 'dateFrom' && header !== 'dateTo' && header !== 'ee_branchcode' && header !== 'ee_lastName' && header !== 'ee_firstName' && header !== 'ee_middleName') {
                        const field = form.getTextField(header);
                        if (field) {
                            let value = row[index];

                            if (index >= 9 && index <= 32 && typeof value === 'number') {
                                value = new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
                            }
                            field.setText(value !== undefined ? value.toString() : '');
                        }
                    }
                }
            });

            form.flatten();
            return pdfDoc.save();
        }));

        const mergedPdf = await mergePdfs(pdfDocs);
        download(mergedPdf, 'merged_2316.pdf', 'application/pdf');
    } catch (error) {
        console.error('Error processing files:', error);
        alert('Error processing files: ' + error);
    } finally {
        document.getElementById("loadingPopup").style.display = "none";
    }
}


async function readExcelFile_2316(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = function(event) {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      if (workbook.SheetNames[0] !== 'form_2316'){
        alert('The first sheet name of the Excel file is not "form_2316".');
        document.getElementById("loadingPopup").style.display = "none";
        return;
      }

      resolve({ headers: json[0], rows: json.slice(1) });
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

async function fetchPdfTemplate_2316() {
  return new Promise((resolve, reject) => {
    google.script.run.withSuccessHandler((data) => {
      const buffer = new Uint8Array(data);
      resolve(buffer.buffer);
    }).withFailureHandler(reject).getPdfTemplate_2316();
  });
}

//-----------------------------------------BIR Forms Merge and Download-----------------------------------------------------
    function validateFileSize(file, maxSizeKB) {
      return file.size <= maxSizeKB * 1024;
    }


    async function mergePdfs(pdfDocs) {
      const mergedPdf = await PDFLib.PDFDocument.create();
      await Promise.all(pdfDocs.map(async (pdfBytes) => {
        const pdf = await PDFLib.PDFDocument.load(pdfBytes);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }));
      return mergedPdf.save();
    }

    function download(data, filename, type) {
      const blob = new Blob([data], { type: type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    }
