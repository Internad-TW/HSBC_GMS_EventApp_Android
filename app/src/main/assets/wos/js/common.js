var Common = {};

Common.useOnlineData = false;
Common.downloadZipLocked = false;

Common.apiUrl = 'https://eventapp-uat.internad.hk/';
//Common.apiUrl = 'http://localhost:33418/';

Common.urlInfo = {
    'login': Common.apiUrl + 'ValidateActivationCode',
    'validate_token': Common.apiUrl + 'ValidateToken',
    'select_device': Common.apiUrl + 'GetDeviceList',
    'replace_device': Common.apiUrl + 'ReplaceDeviceAndGenerateNewToken',
    'download_db': Common.apiUrl + 'EventApp',
    'guest_pack': Common.apiUrl + 'GetHospitalityPackage',
    'notification': Common.apiUrl + 'SetNotification',
    'get_all_event_data': Common.apiUrl + 'GetAllEventDataV2'
};

Common.showLoadingScreen = function () {
    if (document.querySelector('#LoadingScreen') === null) {
        var strHtml = '\
            <div id="LoadingScreen" style="display: none;">\
                <div class="lds-dual-ring"></div>\
            </div>';
        document.querySelector('body').insertAdjacentHTML('beforeend', strHtml);
    }
    document.querySelector('#LoadingScreen').style.display = '';
};

Common.hideLoadingScreen = function () {
    document.querySelector('#LoadingScreen').style.display = 'none';
};

Common.alertMessage = function (msg, title, doAfterClose) {
    if (typeof title === 'undefined') { title = ''; }
    var elem = document.getElementById('AlertScreen');
    if (elem === null) {
        var strHtml = '\
            <div id="AlertScreen" class="alert flex_container flex_v_center"\
                style="display: none;">\
                <div class="alert_message_box width80per">\
                    <div class="alert_title"></div>\
                    <div class="lineheight135per"></div>\
                    <div class="btn_red margintop20px" data-button><p>OK</p></div>\
                </div>\
            </div>';
        document.querySelector('body').insertAdjacentHTML('beforeend', strHtml);
        elem = document.getElementById('AlertScreen');
    }
    elem.querySelector('[data-button]').addEventListener('click', function () {
        document.getElementById('AlertScreen').remove();
        if (typeof doAfterClose === 'function') {
            doAfterClose.call();
        }
    });
    if (title === '') {
        elem.querySelector('.alert_title').style.display = 'none';
    }
    else {
        elem.querySelector('.alert_title').innerText = title;
    }
    elem.querySelector('.lineheight135per').innerHTML = msg;
    elem.style.display = '';
};

Common.setUILanguage = function (page, scope, eventId) {
    cc = Common.getUILang();
    if (typeof eventId !== 'undefined') {
        cc = Common.getEventLangCode(eventId);
    }
    //
    var all;
    if (scope === null || typeof scope === 'undefined') {
        all = [...document.querySelectorAll('[data-lang]')];
    }
    else {
        all = [...document.getElementById(scope).querySelectorAll('[data-lang]')];
    }
    Object.keys(lang[cc][page]).forEach(function (value) {
        var els = all.filter(function (elem) { return value === elem.dataset.lang; });
        if (els.length > 0) {
            els.forEach(function (elem) {
                if (elem.matches('input[type=text]')) {
                    elem.setAttribute('placeholder', lang[cc][page][value]);
                }
                else {
                    elem.innerText = lang[cc][page][value];
                }
            });
        }
    });
};

Common.writeFooterNAV = function () {
    [...document.querySelectorAll('.footer_nav')].forEach(function (elem) {
        elem.innerHTML = '';
        elem.insertAdjacentHTML('beforeend', document.querySelector('#FooterNavTemplate').innerHTML);
    });
};

Common.openPage = function (pageName) {
    [...document.querySelectorAll('[data-page]')].forEach(function (elem) {
        if (elem.dataset.page === pageName) {
            elem.style.display = '';
        }
        else {
            elem.style.display = 'none';
        }
        //nav
        if (typeof elem.dataset.nav !== 'undefined') {
            var regImageName = new RegExp('(\_{1})([^_]+)(\.fw\.png)', 'ig');
            [...elem.querySelectorAll('.icon_bar>a')].forEach(function (elem2) {
                if (elem2.dataset.nav === elem.dataset.nav) {
                    elem2.querySelector('img').src = elem2.querySelector('img').src.replace(regImageName, '$1red$3');
                    elem2.querySelector('span').classList.add('color_red');
                }
                else {
                    elem2.querySelector('img').src = elem2.querySelector('img').src.replace(regImageName, '$1normal$3');
                    elem2.querySelector('span').classList.remove('color_red');
                }
            });
        }
    });
};

Common.getEventLangCode = function (eventId) {
    var result = 'en';
    var eventData = getValidEvents().filter(function (obj) { return Number(obj.Id) === Number(eventId); })[0];
    if (eventData.LanguageCode !== '' &&
        (eventData.LanguageCode === eventData.Language1 || eventData.LanguageCode === eventData.Language2)) {
        result = eventData.LanguageCode;
    }
    if (localStorage.getItem('EventLangs') !== null) {
        var els = JSON.parse(localStorage.getItem('EventLangs'));
        var el = els.filter(function (obj) { return Number(obj.Id) === Number(eventId); })[0];
        if (typeof el !== 'undefined') {
            result = el.Lang;
        }
    }
    return result;
};

Common.getLangIndex = function (event, uiLangCode) {
    var keys = Object.keys(event).filter(function (key) { return /^Language[1-2]{1}$/.test(key); });
    var index = '1';
    var cc = Common.getEventLangCode(event.Id);
    if (typeof uiLangCode !== 'undefined') {
        cc = uiLangCode;
    }
    for (var i = 0; i < keys.length; i++) {
        if (event[keys[i]] === cc) {
            index = keys[i].replace('Language', '');
            break;
        }
    }
    return index;
};

Common.getDateString = function (catName, eventId, date1, date2) {
    var result = '';
    if (typeof catName !== 'undefined') {
        var cc = Common.getEventLangCode(eventId);
        //cc = 'zh-tw';
        moment.locale(cc);
        if (catName === 'HomeTabTitleData') {
            switch (cc) {
                case 'zh-tw':
                    if (moment(date1).month() === moment(date2).month()) {
                        result = moment(date1).format('YYYY年M月D日') + '至' + moment(date2).format('D日');
                    }
                    else {
                        result = moment(date1).format('YYYY年M月D日') + '至' + moment(date2).format('M月D日');
                    }
                    break;
                case 'zh-cn':
                    if (moment(date1).month() === moment(date2).month()) {
                        result = moment(date1).format('YYYY年M月D日') + '至' + moment(date2).format('D日');
                    }
                    else {
                        result = moment(date1).format('YYYY年M月D日') + '至' + moment(date2).format('M月D日');
                    }
                    break;
                default:
                    if (moment(date1).month() === moment(date2).month()) {
                        result = moment(date1).format('D') + ' - ' + moment(date2).format('D MMM YYYY');
                    }
                    else {
                        result = moment(date1).format('D MMM') + ' - ' + moment(date2).format('D MMM YYYY');
                    }
                    break
            }
        }
        if (catName === 'NewsDate') {
            switch (cc) {
                case 'zh-tw':
                    result = moment(date1).format('YYYY年M月D日dddd');
                    break;
                case 'zh-cn':
                    result = moment(date1).format('YYYY年M月D日dddd');
                    break;
                default:
                    result = moment(date1).format('ddd, D MMM, YYYY');
                    break
            }
        }
    }
    return result;
};

Common.getLanguageDisplayName = function (lang) {
    var result = '';
    if (lang === 'en') { result = 'English'; }
    if (lang === 'zh-tw') { result = '繁體'; }
    if (lang === 'zh-cn') { result = '简体'; }
    return result;
};

Common.getUILang = function () {
    var ul = 'en';
    if (localStorage.getItem('EventLangs') !== null) {
        var els = JSON.parse(localStorage.getItem('EventLangs'));
        if (els.length === 1) {
            ul = els[0].Lang;
        }
        else {
            if (els.filter(function (obj) { return obj.Lang === 'en'; }).length > 0) { // 只要有一個Event選了英文那UI就是英文
                ul = 'en';
            }
            else { // 如果所有的Event都選擇一樣的語言則UI顯示該語言，反則UI顯示英文
                var sameLang = true;
                var firstLang = els[0].Lang;
                els.forEach(function (obj) {
                    if (firstLang !== obj.Lang) {
                        sameLang = false;
                    }
                });
                if (sameLang) {
                    ul = firstLang;
                }
                else {
                    ul = 'en';
                }
            }
        }
        localStorage.setItem('ui_lang', ul);
    }
    if (localStorage.getItem('ui_lang') !== null) {
        ul = localStorage.getItem('ui_lang');
    }
    return ul;
};

Common.htmlDecode = function (text) {
    var div = document.createElement("div");
    div.innerHTML = text;
    return ('textContent' in div) ? div.textContent : div.innerText;
};

Common.getServerImagePath = function (eventCode) {
    return Common.apiUrl + 'CMS/' + eventCode + '/Uploaded/';
};

Common.clearLocalStorage = function () {
    localStorage.removeItem("DownloadDbMd5");
    localStorage.removeItem("Notifications");
    localStorage.removeItem("EventLangs");
    localStorage.removeItem("GuestName");
    localStorage.removeItem("ui_lang");
    localStorage.removeItem("NewsDataFromPN");
    localStorage.removeItem("PopupNotice");
};