//#region Dom Events
document.addEventListener('DOMContentLoaded', function () {
    Common.setUILanguage('login');
    document.getElementById("tbPasscode").placeholder = lang[Common.getUILang()].login.passcode_placeholder;
    //
    if (localStorage.getItem('TokenExpiry') !== null) {
        localStorage.removeItem('TokenExpiry');
        window.addEventListener('load', showInputForm);
    }
    else {
        var urlParams = new URLSearchParams(location.search);
        if (urlParams.get('EventId') !== null && urlParams.get('NewsId') !== null) {
            localStorage.setItem('NewsDataFromPN', JSON.stringify({ "eventId": urlParams.get('EventId'), "newsId": urlParams.get('NewsId') }));
        }
        if (__activeInfo.token !== '' && moment().isSameOrBefore(moment(__activeInfo.expiry_date, 'YYYYMMDD'), 'day')) {
            Common.showLoadingScreen();
            axios
                .post(Common.urlInfo.validate_token, {
                    Token: __activeInfo.token,
                    Date: md5(moment().format("YYYYMMDD")).toUpperCase()
                })
                .then(function (res) {
                    var data = res.data;
                    if (data.Status.ReturnCode === "00") {
                        if (Number(data.IsValid) === 1 || Number(data.IsValid) === 2) {
                            __activeInfo.expiry_date = data.ExpiryDate;
                            var conten = 'var __activeInfo = ' + JSON.stringify(__activeInfo);
                            callAppWritJsFile(conten, 'active.js');
                            location.href = 'download_db.html';
                        }
                        else {
                            Common.clearLocalStorage();
                            Common.alertMessage(lang[Common.getUILang()]["error_msg"]["activation_code_expired"], '', showInputForm);
                        }
                    }
                    else {
                        Common.alertMessage(lang[Common.getUILang()]["error_code"][data.Status.ReturnCode], "Error Code: " + data.Status.ReturnCode, showInputForm);
                    }
                })
                .catch(function (error) {
                    if (error.message === 'Network Error') {
                        location.href = 'download_db.html';
                    }
                    else {
                        console.error(error);
                    }
                })
                .finally(function () {
                    Common.hideLoadingScreen();
                });
        }
        else {
            Common.clearLocalStorage();
            window.addEventListener('load', showInputForm);
        }
    }
});

var showInputForm = function () {
    var login_bg = document.getElementById('login_bg');
    login_bg.style.opacity = '0';
    var hsbc_logo = document.getElementById('hsbc_logo');
    hsbc_logo.style.opacity = '1';
    var hsbc_title = document.getElementById('hsbc_title');
    hsbc_title.style.opacity = '1';
    var hsbc_input = document.getElementById('hsbc_input');
    hsbc_input.style.opacity = '1';
    hsbc_input.style.marginTop = '40px';
    var main_content = document.getElementById('btn_submit');
    btn_submit.style.opacity = '1';
};
//#endregion

//#region Common Functions
var openPage = function (pageName) {
    [...document.querySelectorAll('div[data-page]')].forEach(function (elem) {
        if (elem.dataset.page === pageName) {
            elem.style.display = '';
        }
        else {
            elem.style.display = 'none';
        }
    });
};

var processAjaxError = function (err) {
    if (err.message === 'Network Error') {
        Common.alertMessage(lang[Common.getUILang()]["error_msg"]["net_fail"]);
    }
    else {
        console.error(err);
    }
};

var callAppWritJsFile = function (content, fileName) {
    content = content.replace(/"/g, '\\"');
    if (__deviceInfo.OS.toLowerCase() === 'android') {
        android.writeJsFile('{"FileName": "' + fileName + '", "Content": "' + content + '"}');
    }
    else if (__deviceInfo.OS.toLowerCase() === 'ios') {
        webkit.messageHandlers.writeJsFile.postMessage('{"FileName": "' + fileName + '", "Content": "' + content + '"}');
    }
    else {
        console.log('FileName: ' + fileName + ', Content: ' + content);
    }
    localStorage.setItem('ActiveInfo', content);
};
//#endregion

//#region Login Functions (按下submit後去API驗證passcode)
var validateActivationCode = function () {
    if (document.getElementById('tbPasscode').value !== '') {
        if (document.getElementById('tbPasscode').value === 'for_approval') {
            localStorage.removeItem('DownloadDbMd5');
            localStorage.removeItem('Notifications')
            localStorage.setItem('ForApproval', 'Yes');
            location.href = 'main.html';
        }
        else {
            Common.showLoadingScreen();
            axios
                .post(Common.urlInfo.login, {
                    ActivationCode: document.getElementById("tbPasscode").value,
                    Date: md5(moment().format("YYYYMMDD")).toUpperCase(),
                    CurrentDeviceName: __deviceInfo.Name,
                    CurrentDeviceModel: __deviceInfo.Model,
                    CurrentDeviceOS: __deviceInfo.OS
                })
                .then(function (res) {
                    var data = res.data;
                    if (data.Status.ReturnCode === "00") { // 00表示API回傳成功無錯誤
                        if (data.IsValid === "1" || data.IsValid === "3") { // 1表示token有效, 3表示token有效但是要選擇取代的裝置
                            if (data.IsValid === "1") {
                                // valid
                                __activeInfo.token = data.Token.Code;
                                __activeInfo.expiry_date = data.Token.ExpiryDate
                                var content = 'var __activeInfo = ' + JSON.stringify(__activeInfo) + ';'
                                callAppWritJsFile(content, 'active.js');
                                location.href = 'login-success.html';
                            } else {
                                // valid but exceeds token quota (去裝置選擇的Page)
                                showSelectDevicePage(document.getElementById("tbPasscode").value.toString());
                            }
                        } else {
                            if (data.IsValid === "0") { // 無效的token
                                // not valid 
                                if (localStorage.getItem("ActivationCodeWrongTimes") === null) { // 如果連續輸入錯誤三次就會彈一次訊息
                                    localStorage.setItem("ActivationCodeWrongTimes", "0");
                                }
                                var acwt = Number(localStorage.getItem("ActivationCodeWrongTimes")) + 1;
                                localStorage.setItem("ActivationCodeWrongTimes", acwt.toString());
                                if (acwt >= 3) {
                                    Common.alertMessage(lang[Common.getUILang()]["error_msg"]["wrong_activation_code_three_times"]);
                                    localStorage.setItem("ActivationCodeWrongTimes", "0");
                                } else {
                                    Common.alertMessage(lang[Common.getUILang()]["error_msg"]["wrong_activation_code"]);
                                }
                            } else {
                                // valid but expiry
                                Common.alertMessage(lang[Common.getUILang()]["error_msg"]["activation_code_expired"]);
                            }
                        }
                    } else {
                        Common.alertMessage(lang[Common.getUILang()]["error_code"][data.Status.ReturnCode], "Error Code: " + data.Status.ReturnCode);
                    }
                })
                .catch(function (error) {
                    processAjaxError(error);
                })
                .finally(function () {
                    Common.hideLoadingScreen();
                });
        }
    }
};
//#endregion

//#region Select Device Functions (選擇取代裝置的page)
var showSelectDevicePage = function (activationCode) {
    axios
        .post(Common.urlInfo.select_device, {
            ActivationCode: activationCode,
            Date: md5(moment().format("YYYYMMDD")).toUpperCase()
        })
        .then(function (res) {
            var data = res.data;
            if (data.Status.ReturnCode === "00") {
                var page = document.querySelector('div[data-page=SelectDevice]');
                //set msg
                page.querySelector('[data-alert-title]').innerText = lang[Common.getUILang()].login_select_device.alert_msg_title;
                var deciveNumber = lang[Common.getUILang()].login_select_device.device_number[data.DeviceList.length.toString()];
                page.querySelector('[data-alert-content]').innerText = lang[Common.getUILang()].login_select_device.alert_msg_content.replace('[#count#]', deciveNumber);
                //set devices list
                var devices = page.querySelectorAll('[data-transfer]');
                for (var i = 0; i < devices.length; i++) {
                    if (i > 0) {
                        devices[i].remove();
                    }
                }
                var device = page.querySelector('[data-transfer]');
                data.DeviceList.forEach(function (obj, index) {
                    if (index === 0) {
                        device.querySelector('div[data-name]').dataset.id = obj.ID;
                        device.querySelector('div[data-name]').innerText = obj.Name;
                        device.querySelector('div[data-model]').innerText = obj.Model;
                    }
                    else {
                        device.insertAdjacentElement('afterend', device.cloneNode(true));
                        devices = page.querySelectorAll('[data-transfer]');
                        devices[index].querySelector('div[data-name]').dataset.id = obj.ID;
                        devices[index].querySelector('div[data-name]').innerText = obj.Name;
                        devices[index].querySelector('div[data-model]').innerText = obj.Model;
                    }
                });
                devices = [...page.querySelectorAll('[data-transfer]')];
                var tmpZIndex = 60;
                devices.forEach(function (elem) {
                    elem.style.zIndex = tmpZIndex.toString();
                    tmpZIndex = tmpZIndex - 10;
                });
                openPage('SelectDevice');
            }
            else {
                Common.alertMessage(lang[Common.getUILang()]["error_code"][data.Status.ReturnCode], "Error Code: " + data.Status.ReturnCode);
            }
        })
        .catch(function (error) {
            processAjaxError(error);
        })
};

var showYesOrNoButton = function (elem) {
    var root = elem.closest('div[data-transfer]');
    if (root) {
        var page = document.querySelector('div[data-page=SelectDevice]');
        var canShow = true;
        [...page.querySelectorAll('div[data-transfer]')].forEach(function (elem) {
            if (elem !== root) {
                if (elem.children[1].style.display !== 'none') {
                    canShow = false;
                }
            }
        });
        if (canShow) {
            if (root.children[1].style.display === 'none') {
                root.children[1].style.display = '';
                root.children[1].addEventListener('animationend', function (e) {
                    e.target.classList.remove('animated', 'fadeInDown', 'faster');
                    e.target.parentElement.classList.add('section_select');
                }, { once: true });
                root.children[1].classList.add('animated', 'fadeInDown', 'faster');
            } else {
                root.children[1].addEventListener('animationend', function (e) {
                    e.target.style.display = 'none';
                    e.target.classList.remove('animated', 'fadeOutUp', 'faster');
                }, { once: true });
                root.classList.remove('section_select');
                root.children[1].classList.add('animated', 'fadeOutUp', 'faster');
            }
        }
    }
};

var replaceSelectedDevice = function (elem) {
    var root = elem.closest('div[data-transfer]');
    if (root) {
        var selectedDeviceId = root.querySelector('div[data-name]').dataset.id;
        Common.showLoadingScreen();
        axios
            .post(Common.urlInfo.replace_device, {
                ActivationCode: document.getElementById("tbPasscode").value,
                Date: md5(moment().format("YYYYMMDD")).toUpperCase(),
                CurrentDeviceName: __deviceInfo.Name,
                CurrentDeviceModel: __deviceInfo.Model,
                CurrentDeviceOS: __deviceInfo.OS,
                ReplacedID: selectedDeviceId
            })
            .then(function (res) {
                var data = res.data;
                if (data.Status.ReturnCode === "00") {
                    var data = res.data;
                    __activeInfo.token = data.Token.Code;
                    __activeInfo.expiry_date = data.Token.ExpiryDate
                    var content = 'var __activeInfo = ' + JSON.stringify(__activeInfo) + ';'
                    callAppWritJsFile(content, 'active.js');
                    location.href = 'login-success.html';
                } else {
                    Common.alertMessage(lang[Common.getUILang()]["error_code"][data.Status.ReturnCode], "Error Code: " + data.Status.ReturnCode);
                }
            })
            .catch(function (error) {
                processAjaxError(error);
            })
            .finally(function () {
                Common.hideLoadingScreen();
            });
    }
};
//#endregion