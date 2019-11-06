const check_notification_setting_time_interval = 30 * 1000;

//#region [ Window and Document Events ]
document.addEventListener('DOMContentLoaded', function () {
    if (__deviceInfo.OS.toLowerCase() === 'android') { //為了Guest Pack在android的效能，這是引入取消陰影的CSS
        var link = document.createElement('link');
        link.href = 'css/guesp_pack_android.css';
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.media = 'screen,print';
        document.getElementsByTagName('head')[0].appendChild(link);
    }
    if (localStorage.getItem('ActiveInfo') !== null) {
        __activeInfo = JSON.parse(localStorage.getItem('ActiveInfo').replace('var __activeInfo = ', '').replace('};', '}').replace(/\\/g, ''));
    }
    [...document.querySelectorAll('[data-text=GuestName]')].forEach(function (elem) {
        elem.innerText = localStorage.getItem('GuestName');;
    });
    Common.writeFooterNAV(); // 畫NAV
    if (localStorage.getItem('ForApproval') === null) { // 是否由審核人員輸入的密碼進入
        checkEvents();
    }
    else {
        gotoEventListOrHomeTab();
    }
});

window.addEventListener('popstate', function (event) { // 根據URL變化切換頁面
    //console.log('Event State: ' + event.state + ', Typeof: ' + typeof event.state);
    if (event.state === null || typeof event.state === 'undefined') {
        document.getElementById('G_NowPage').value = 'EventList';
        Common.openPage('EventList');
    }
    else {
        if (event.state === 'ContentTab') {
            gotoContentTabPage(location.hash.replace('#', '').replace('Tab', ''), false);
        }
        else if (['Setting', 'NewsDetail', 'Contact'].includes(event.state)) {
            if (event.state === 'Setting') { showSettingPage(true); }
            if (event.state === 'NewsDetail') { showNewsDetailPage(null, true); }
            if (event.state === 'Contact') { showContactPage(true); }
        }
        else if (event.state === 'GuestPackTab') {
            gotoGuestPackTab(true);
        }
        else {
            var floatingPageName = document.getElementById('G_FloatingPage').value;
            if (floatingPageName !== '') {
                document.getElementById('G_NowPage').value = event.state;
                if (floatingPageName === 'Setting') { showSettingPage(false); }
                if (floatingPageName === 'NewsDetail') { showNewsDetailPage(null, false); }
                if (floatingPageName === 'Contact') { showContactPage(false); }
            }
            else {
                Common.openPage(event.state);
                history.replaceState(event.state, null, 'main.html#' + event.state);
            }
        }
    }
});
//#endregion

//#region [ Main Tabs Function ]
var checkEvents = function () {
    Common.showLoadingScreen();
    axios
        .post(Common.urlInfo.get_all_event_data, { // online取得server資料，for real time
            Token: __activeInfo.token,
            Hash: (localStorage.getItem('DownloadDbMd5') === null ? '' : localStorage.getItem('DownloadDbMd5'))
        })
        .then(function (res) {
            if (res.data !== '') {
                if (res.data == 'TokenExpiry') {
                    localStorage.setItem('TokenExpiry', 'Y');
                    Common.alertMessage(lang[Common.getUILang()]["error_msg"]["token_expiry"], '', function () {
                        Common.clearLocalStorage();
                        location.href = 'login.html';
                    });
                }
                else {
                    eval(res.data);
                    Common.useOnlineData = true;
                    downloadZip();
                }
            }
        })
        .catch(function (error) {
            if (error.message === "Network Error") {
                Common.useOnlineData = false;
            }
            else {
                console.error(error);
            }
        })
        .finally(function () {
            Common.hideLoadingScreen();
            if (localStorage.getItem('TokenExpiry') !== null) {
                Common.openPage('Empty');
            }
            else {
                if (localStorage.getItem('NewsDataFromPN') !== null) {
                    var news = JSON.parse(localStorage.getItem('NewsDataFromPN'));
                    localStorage.removeItem('NewsDataFromPN');
                    showNewsDetailFromPushNotification(news.eventId, news.newsId);
                }
                else {
                    gotoEventListOrHomeTab();
                }
                checkNotificationPushSetting();
                //set button
                var events = getValidEvents();
                [...document.querySelectorAll('[data-button=BackToEventListButton]')].forEach(function (elem) {
                    elem.style.display = (events.length === 1 ? 'none' : '');
                });
            }
        });
};

var gotoEventListPage = function (isFirst) {
    if (localStorage.getItem('ForApproval') === null) {
        Common.showLoadingScreen();
        axios
            .post(Common.urlInfo.get_all_event_data, { // online取得server資料，for real time
                Token: __activeInfo.token,
                Hash: (localStorage.getItem('DownloadDbMd5') === null ? '' : localStorage.getItem('DownloadDbMd5'))
            })
            .then(function (res) {
                if (res.data !== '') {
                    if (res.data == 'TokenExpiry') {
                        localStorage.setItem('TokenExpiry', 'Y');
                        Common.alertMessage(lang[Common.getUILang()]["error_msg"]["token_expiry"], '', function () {
                            Common.clearLocalStorage();
                            location.href = 'login.html';
                        });
                    }
                    else {
                        eval(res.data);
                        Common.useOnlineData = true;
                        downloadZip();
                    }
                }
            })
            .catch(function (error) {
                if (error.message === "Network Error") {
                    Common.useOnlineData = false;
                }
                else {
                    console.error(error);
                }
            })
            .finally(function () {
                Common.hideLoadingScreen();
                if (localStorage.getItem('TokenExpiry') !== null) {
                    Common.openPage('Empty');
                }
                else {
                    gotoEventListPageContent(isFirst);
                }
            });
    }
    else {
        gotoEventListPageContent(isFirst);
    }

};

var gotoEventListPageContent = function (isFirst) { // isFirst 為了android上一頁功能做的判斷
    if (typeof isFirst === 'undefined') { isFirst = true; }
    Common.setUILanguage('event_list', 'EventList');
    var root = document.querySelector('.banner_list_top');
    if (root) {
        var validEvents = getValidEvents();
        var tmp = root.children[0].outerHTML;
        root.innerHTML = '';
        for (var i = 0; i < validEvents.length; i++) {
            root.insertAdjacentHTML('beforeend', tmp);
        }
        var i = 0;
        validEvents.forEach(function (obj) {
            root.children[i].dataset.eventId = obj.Id;
            if (Common.useOnlineData) {
                root.children[i].children[0].src = Common.getServerImagePath(obj.Code) + obj.ListImage;
            }
            else {
                root.children[i].children[0].src = 'data/' + obj.Code + '/EventApp/' + obj.ImageUsedFolder + '/' + obj.ListImage;
            }
            i++;
        });
        //set event langs
        if (localStorage.getItem('EventLangs') === null) {
            var els = [];
            validEvents.forEach(function (obj) {
                els.push({ "Id": obj.Id, "Lang": "en" });
            });
            localStorage.setItem('EventLangs', JSON.stringify(els));
        }
    }
    document.getElementById('G_NowPage').value = 'EventList';
    document.getElementById('G_FloatingPage').value = '';
    Common.openPage('EventList');
    if (!isFirst) {
        history.pushState('EventList', null, 'main.html#EventList');
    }
    localStorage.removeItem('HomeFlag');
}

var gotoHomeTabPage = function (elem, reloadData) {
    if (localStorage.getItem('ForApproval') === null) {
        Common.showLoadingScreen();
        axios
            .post(Common.urlInfo.get_all_event_data, { // online取得server資料，for real time
                Token: __activeInfo.token,
                Hash: (localStorage.getItem('DownloadDbMd5') === null ? '' : localStorage.getItem('DownloadDbMd5'))
            })
            .then(function (res) {
                if (res.data !== '') {
                    if (res.data == 'TokenExpiry') {
                        localStorage.setItem('TokenExpiry', 'Y');
                        Common.alertMessage(lang[Common.getUILang()]["error_msg"]["token_expiry"], '', function () {
                            Common.clearLocalStorage();
                            location.href = 'login.html';
                        });
                    }
                    else {
                        eval(res.data);
                        Common.useOnlineData = true;
                        downloadZip();
                    }
                }
            })
            .catch(function (error) {
                if (error.message === "Network Error") {
                    Common.useOnlineData = false;
                }
                else {
                    console.error(error);
                }
            })
            .finally(function () {
                Common.hideLoadingScreen();
                if (localStorage.getItem('TokenExpiry') !== null) {
                    Common.openPage('Empty');
                }
                else {
                    gotoHomeTabPageContent(elem, reloadData);
                }
            });
    }
    else {
        gotoHomeTabPageContent(elem, reloadData);
    }

};

var gotoHomeTabPageContent = function (elem, reloadData) {
    var eventId = '';
    if (typeof elem !== 'undefined') {
        eventId = elem.dataset.eventId;
        document.getElementById('G_EventId').value = eventId;
        localStorage.setItem('EventId', eventId);
    }
    else {
        eventId = document.getElementById('G_EventId').value;
        if (eventId === '') {
            eventId = localStorage.getItem('EventId');
            document.getElementById('G_EventId').value = eventId;
        }
    }
    if (typeof reloadData === 'undefined') { reloadData = false; }
    showPopupNotice(eventId);
    getHomeTabData(eventId);
    //
    if (!reloadData) {
        document.getElementById('G_NowPage').value = 'HomeTab';
        document.getElementById('G_FloatingPage').value = '';
        Common.openPage('HomeTab');
        if (localStorage.getItem('HomeFlag') !== null) {
            history.pushState('HomeTab', null, 'main.html?HP#HomeTab');
            localStorage.removeItem('HomeFlag');
        }
        else {
            history.pushState('HomeTab', null, 'main.html#HomeTab');
        }
    }
}

var getHomeTabData = function (eventId) {
    document.getElementById('ContentTab').dataset.nav = 'Home';
    Common.setUILanguage('event_list', 'HomeTab', eventId);
    Common.setUILanguage('home_tab', 'HomeTab', eventId);
    Common.setUILanguage('nav', 'HomeTab', eventId);
    var ht = document.getElementById('HomeTab');
    var eventData = db.Events.filter(function (obj) { return obj.Id.toString() === eventId; })[0];
    var langIndex = Common.getLangIndex(eventData);
    //set header
    if (Common.useOnlineData) {
        ht.querySelector('.hero_image').style.backgroundImage = 'url(' + Common.getServerImagePath(eventData.Code) + eventData.HomeTab.BannerBackgroundImage + ')';
    }
    else {
        ht.querySelector('.hero_image').style.backgroundImage = 'url(data/' + eventData.Code + '/EventApp/' + eventData.ImageUsedFolder + '/' + eventData.HomeTab.BannerBackgroundImage + ')';
    }
    if (Common.useOnlineData) {
        ht.querySelector('.hero_event_logo').src = Common.getServerImagePath(eventData.Code) + eventData['LogoImage' + langIndex];
    }
    else {
        ht.querySelector('.hero_event_logo').src = 'data/' + eventData.Code + '/EventApp/' + eventData.ImageUsedFolder + '/' + eventData['LogoImage' + langIndex];
    }
    ht.querySelectorAll('.hero_event_title>span')[0].innerHTML = eventData['ShortTitle' + langIndex];
    ht.querySelectorAll('.hero_event_title>span')[1].innerHTML = Common.getDateString('HomeTabTitleData', eventData.Id, eventData.EventStartDate, eventData.EventEndDate);
    if (eventData.HomeTab.CountDownClock === 1) {
        ht.querySelector('.home_timer').style.display = '';
        var strTimeLimit = eventData.HomeTab.CountDownClockTargetDate;
        if (eventData.CountDownClockTargetTime !== '') {
            strTimeLimit += ' ' + eventData.HomeTab.CountDownClockTargetTime;
        }
        var timeLimit = moment.tz(strTimeLimit, eventData.TimeZone);
        var now = moment.tz(eventData.TimeZone);
        //console.log('Now: ' + now.format() + ', Limit: ' + timeLimit.format())
        if (timeLimit >= now && (eventData.HomeTab.CountDownUnitsDay === 1 || eventData.HomeTab.CountDownUnitsHour === 1 || eventData.HomeTab.CountDownUnitsMinute === 1)) {
            var dt = countdown(now, timeLimit, ~countdown.ALL | countdown.DAYS | countdown.HOURS | countdown.MINUTES);
            if (dt.minutes >= 0) {
                ht.querySelector('#HomeTab_CC_Minute').style.display = '';
                ht.querySelector('#HomeTab_CC_Minute').children[0].innerText = dt.minutes.toString();
            }
            if (dt.hours >= 1) {
                ht.querySelector('#HomeTab_CC_Hour').nextElementSibling.style.display = '';
                ht.querySelector('#HomeTab_CC_Hour').style.display = '';
                ht.querySelector('#HomeTab_CC_Hour').children[0].innerText = dt.hours.toString();
            }
            else {
                if (dt.days >= 1) {
                    ht.querySelector('#HomeTab_CC_Hour').nextElementSibling.style.display = '';
                    ht.querySelector('#HomeTab_CC_Hour').style.display = '';
                    ht.querySelector('#HomeTab_CC_Hour').children[0].innerText = dt.hours.toString();
                }
                else {
                    ht.querySelector('#HomeTab_CC_Hour').nextElementSibling.style.display = 'none';
                    ht.querySelector('#HomeTab_CC_Hour').style.display = 'none';
                }
            }
            if (dt.days >= 1) {
                ht.querySelector('#HomeTab_CC_Day').nextElementSibling.style.display = '';
                ht.querySelector('#HomeTab_CC_Day').style.display = '';
                ht.querySelector('#HomeTab_CC_Day').children[0].innerText = dt.days.toString();
            }
            else {
                ht.querySelector('#HomeTab_CC_Day').nextElementSibling.style.display = 'none';
                ht.querySelector('#HomeTab_CC_Day').style.display = 'none';
            }
            if (eventData.HomeTab.CountDownUnitsMinute !== 1) {
                ht.querySelector('#HomeTab_CC_Minute').previousElementSibling.style.display = 'none';
                ht.querySelector('#HomeTab_CC_Minute').style.display = 'none';
            }
            if (eventData.HomeTab.CountDownUnitsHour !== 1) {
                ht.querySelector('#HomeTab_CC_Hour').previousElementSibling.style.display = 'none';
                ht.querySelector('#HomeTab_CC_Hour').style.display = 'none';
                ht.querySelector('#HomeTab_CC_Minute').previousElementSibling.style.display = 'none';
                ht.querySelector('#HomeTab_CC_Minute').style.display = 'none';
            }
            //
            if (ht.querySelector('#HomeTab_CC_Day').style.display === 'none' && ht.querySelector('#HomeTab_CC_Hour').style.display === 'none' &&
                ht.querySelector('#HomeTab_CC_Minute').style.display === 'none') {
                ht.querySelector('.home_timer').style.display = 'none';
            }
            else {
                //var ulc = Common.getUILang();
                var ulc = Common.getEventLangCode(eventId);
                ht.querySelector('#HomeTab_CC_Day').children[1].innerText = (dt.days <= 1 ? lang[ulc].home_tab.day : lang[ulc].home_tab.days);
                ht.querySelector('#HomeTab_CC_Hour').children[1].innerText = (dt.hours <= 1 ? lang[ulc].home_tab.hour : lang[ulc].home_tab.hours);
                ht.querySelector('#HomeTab_CC_Minute').children[1].innerText = (dt.minutes <= 1 ? lang[ulc].home_tab.minute : lang[ulc].home_tab.minutes);
            }
        }
        else {
            ht.querySelector('.home_timer').style.display = 'none';
        }
    }
    else {
        ht.querySelector('.home_timer').style.display = 'none';
    }
    //set news list
    var newsList = ht.querySelector('#HomeTab_NewsList');
    if (eventData.HomeTab.EventNews === 1) {
        newsList.style.display = '';
        var tmp = newsList.children[0].outerHTML;
        newsList.innerHTML = '';
        if (eventData.HomeTab.NewsList === null || eventData.HomeTab.NewsList.length === 0) {
            newsList.insertAdjacentHTML('beforeend', tmp);
            newsList.lastElementChild.style.display = 'none';
        }
        else {
            for (var i = 0; i < eventData.HomeTab.NewsList.length; i++) {
                newsList.insertAdjacentHTML('beforeend', tmp);
            }
        }
        var i = 0;
        eventData.HomeTab.NewsList.forEach(function (obj) {
            newsList.children[i].style.display = '';
            newsList.children[i].dataset.newsId = obj.Id;
            if (Common.useOnlineData) {
                newsList.children[i].querySelector('.news_image').src = Common.getServerImagePath(eventData.Code) + obj.ThumbnailImage;
            }
            else {
                newsList.children[i].querySelector('.news_image').src = 'data/' + eventData.Code + '/EventApp/' + eventData.ImageUsedFolder + '/' + obj.ThumbnailImage;
            }
            newsList.children[i].querySelector('.news_title').innerHTML = obj['Headline' + langIndex];
            newsList.children[i].querySelector('.news_details').innerHTML = obj['Summary' + langIndex];
            newsList.children[i].querySelector('.news_date').innerHTML = Common.getDateString('NewsDate', eventData.Id, obj.PublishDate);
            i++;
        });
    }
    else {
        newsList.style.display = 'none';
    }
};

var gotoContentTabPage = function (nav, needPushState, reloadData) {
    if (localStorage.getItem('ForApproval') === null) {
        Common.showLoadingScreen();
        axios
            .post(Common.urlInfo.get_all_event_data, {
                Token: __activeInfo.token,
                Hash: (localStorage.getItem('DownloadDbMd5') === null ? '' : localStorage.getItem('DownloadDbMd5'))
            })
            .then(function (res) {
                if (res.data !== '') {
                    if (res.data == 'TokenExpiry') {
                        localStorage.setItem('TokenExpiry', 'Y');
                        Common.alertMessage(lang[Common.getUILang()]["error_msg"]["token_expiry"], '', function () {
                            Common.clearLocalStorage();
                            location.href = 'login.html';
                        });
                    }
                    else {
                        eval(res.data);
                        Common.useOnlineData = true;
                        downloadZip();
                    }
                }
            })
            .catch(function (error) {
                if (error.message === "Network Error") {
                    Common.useOnlineData = false;
                }
                else {
                    console.error(error);
                }
            })
            .finally(function () {
                Common.hideLoadingScreen();
                if (localStorage.getItem('TokenExpiry') !== null) {
                    Common.openPage('Empty');
                }
                else {
                    gotoContentTabPageContent(nav, needPushState, reloadData);
                }
            });
    }
    else {
        gotoContentTabPageContent(nav, needPushState, reloadData);
    }
};

var gotoContentTabPageContent = function (nav, needPushState, reloadData) {
    if (typeof needPushState === 'undefined') { needPushState = true; }
    if (typeof reloadData === 'undefined') { reloadData = false; }
    Common.setUILanguage('nav', 'ContentTab');
    eventId = document.getElementById('G_EventId').value;
    if (eventId === '') {
        eventId = localStorage.getItem('EventId');
        document.getElementById('G_EventId').value = eventId;
    }
    getContentTabData(eventId, nav);
    if (!reloadData) {
        document.getElementById('G_NowPage').value = 'ContentTab';
        document.getElementById('G_FloatingPage').value = '';
        Common.openPage('ContentTab');
        if (needPushState) {
            history.pushState('ContentTab', null, 'main.html#' + nav + 'Tab');
        }
    }
};

var getContentTabData = function (eventId, nav, otherId) {
    var rootId = '';
    if (typeof otherId === 'undefined') {
        rootId = 'ContentTab';
    }
    else {
        rootId = 'Contact';
    }
    var ct = document.getElementById(rootId);
    Common.setUILanguage('event_list', rootId, eventId);
    Common.setUILanguage('home_tab', rootId, eventId);
    Common.setUILanguage('nav', rootId, eventId);
    ct.dataset.nav = nav;
    var eventData = db.Events.filter(function (obj) { return obj.Id.toString() === eventId; })[0];
    var langIndex = Common.getLangIndex(eventData);
    var contentData = eventData[nav + 'Tab'];
    if (Common.useOnlineData) {
        ct.querySelector('#ContentTab_BannerImage').src = Common.getServerImagePath(eventData.Code) + contentData['BannerImage' + langIndex];
    }
    else {
        ct.querySelector('#ContentTab_BannerImage').src = 'data/' + eventData.Code + '/EventApp/' + eventData.ImageUsedFolder + '/' + contentData['BannerImage' + langIndex];
    }
    ct.querySelector('#ContentTab_Title').innerHTML = contentData['Title' + langIndex];
    //set contents
    var ctel = ct.querySelector('#ContentTab_Content');
    ctel.innerHTML = '';
    var tmp = '<div>' + document.getElementById('ContentTabContentTemplate').innerHTML + '</div>';
    var i = 0;
    contentData.SubSections.forEach(function (obj) {
        if (obj.ContentType.toString() === '1') { //text content
            ctel.insertAdjacentHTML('beforeend', tmp);
            if (obj['Title' + langIndex] === '') {
                ctel.children[i].querySelector('h2').remove();
            }
            else {
                ctel.children[i].querySelector('h2').innerHTML = obj['Title' + langIndex];
            }
            ctel.children[i].querySelector('div.lineheight135per').innerHTML = obj['Text' + langIndex];
            ctel.children[i].querySelector('img').remove();
            ctel.children[i].querySelector('div.xauto').remove();
        }
        if (obj.ContentType.toString() === '2') { //image content
            ctel.insertAdjacentHTML('beforeend', tmp);
            if (obj['Title' + langIndex] === '') {
                ctel.children[i].querySelector('h2').remove();
            }
            else {
                ctel.children[i].querySelector('h2').innerHTML = obj['Title' + langIndex];
            }
            ctel.children[i].querySelector('div.lineheight135per').remove();
            if (Common.useOnlineData) {
                ctel.children[i].querySelector('img').src = Common.getServerImagePath(eventData.Code) + obj['Image' + langIndex];
            }
            else {
                ctel.children[i].querySelector('img').src = 'data/' + eventData.Code + '/EventApp/' + eventData.ImageUsedFolder + '/' + obj['Image' + langIndex];
            }
            ctel.children[i].querySelector('div.xauto').remove();
        }
        if (obj.ContentType.toString() === '3') { //session content
            ctel.insertAdjacentHTML('beforeend', tmp);
            if (obj['Title' + langIndex] === '') {
                ctel.children[i].querySelector('h2').remove();
            }
            else {
                ctel.children[i].querySelector('h2').innerHTML = obj['Title' + langIndex];
            }
            ctel.children[i].querySelector('div.lineheight135per').remove();
            ctel.children[i].querySelector('img').remove();
            var displaySession = (obj.DisplayScope.toString() === '1');
            if (!displaySession) {
                displaySession = ('[' + eventData.TicketId.replace(',', '][') + ']').includes(obj.TicketId.toString());
            }
            if (displaySession) {
                var sessionData = obj.Session;
                var elem = ctel.children[i].querySelector('div.xauto').querySelector('table');
                for (var j = 0; j < sessionData.length; j++) {
                    if (j > 0) {
                        elem.querySelector('tbody').insertAdjacentElement('beforeend', elem.querySelector('tbody').children[0].cloneNode(true));
                    }
                    elem.querySelector('tbody').children[j].children[0].innerHTML = sessionData[j]['Time' + langIndex];
                    elem.querySelector('tbody').children[j].children[1].innerHTML = sessionData[j]['Text' + langIndex];
                }
            }
            else {
                ctel.children[i].querySelector('div.xauto').remove();
            }
        }
        i++;
    });
    //
    [...ctel.querySelectorAll('a')].forEach(function (elem) {
        elem.setAttribute('onclick', 'processLinkAction(this); return false;');
    });
};

var gotoGuestPackTab = function () {
    var eventData = getValidEvents().filter(function (obj) { return Number(obj.Id) === Number(document.getElementById('G_EventId').value); })[0];
    Common.showLoadingScreen();
    axios
        .post(Common.urlInfo.guest_pack, {
            Token: __activeInfo.token,
            Date: md5(moment().format("YYYYMMDD")).toUpperCase(),
            EventID: eventData.Id,
            Language: eventData['ServerLanguage' + Common.getLangIndex(eventData)]
        })
        .then(function (res) {
            var data = res.data;
            if (data.Status.ReturnCode === '00') {
                gotoGuestPackTabContent(data.GuestList);
            }
            else {
                Common.alertMessage(lang[Common.getUILang()]["error_code"][data.Status.ReturnCode], "Error Code: " + data.Status.ReturnCode);
            }
        })
        .catch(function (error) {
            if (error.message === "Network Error") {
                Common.alertMessage(lang[Common.getUILang()]["error_msg"]["net_fail_for_guest_pack"]);
            } else {
                console.error(error);
            }
        })
        .finally(function () {
            Common.hideLoadingScreen();
        });
};

var gotoGuestPackTabContent = function (guestPackData) {
    document.getElementById('ContentTab').dataset.nav = 'GuestPack';
    var nowPage = document.getElementById(document.getElementById('G_NowPage').value);
    var gpPage = document.getElementById('GuestPackTab');
    var eventId = document.getElementById('G_EventId').value;
    var eventData = getValidEvents().filter(function (obj) { return Number(obj.Id) === Number(eventId); })[0];
    var langIndex = Common.getLangIndex(eventData);
    Common.setUILanguage('guest_packget', 'GuestPackTab', eventId);
    Common.setUILanguage('event_list', 'GuestPackTab', eventId);
    Common.setUILanguage('home_tab', 'GuestPackTab', eventId);
    Common.setUILanguage('nav', 'GuestPackTab');
    //#region Set Content (由CMS設定相關的欄位資料與顯示與否)
    var gpData = eventData.GuestPackage;
    var gpCard = gpPage.querySelector('#GuestPack_CardList').lastElementChild;
    if (Number(gpData.DisplayGuestName) === 0) {
        gpCard.querySelector('[data-display-field=GuestName]').visibility = 'hidden';
    }
    else {
        gpCard.querySelector('[data-display-field=GuestName]').visibility = 'visible';
    }
    //#region QR Code Panel
    var tmpPanel = gpCard.querySelector('[data-display-field=QRCode]');
    if (Number(gpData.DisplayQRcode) === 0) {
        //tmpPanel.previousElementSibling.style.display = 'none';
        //tmpPanel.style.display = 'none';
        tmpPanel.parentElement.style.display = 'none';
    }
    else {
        //tmpPanel.previousElementSibling.style.display = '';
        //tmpPanel.style.display = '';
        tmpPanel.parentElement.style.display = '';
        tmpPanel.previousElementSibling.innerHTML = gpData['QRcodeDescription' + langIndex];
        QrCodeWithLogo.toCanvas({
            canvas: tmpPanel.querySelector('canvas'),
            content: tmpPanel.querySelector('canvas').dataset.qrCode,
            width: Math.round(window.innerWidth * 0.7),
            errorCorrectionLevel: 'H',
            logo: { src: 'image/qr_hsbc_logo_color539.fw.png', bgColor: 'transparent' }
        });
    }
    //#endregion
    //#region Ticket Redemption Panel
    tmpPanel = gpCard.querySelector('[data-display-field=TicketRedemption]');
    if (Number(gpData.DisplayTicketRedemption) === 0) {
        tmpPanel.parentElement.style.display = 'none';
    }
    else {
        tmpPanel.parentElement.style.display = '';
        tmpPanel.previousElementSibling.innerText = gpData['TicketRedemptionTitle' + langIndex];
        if (gpData['TicketRedemptionDescription' + langIndex] === '' || gpData['TicketRedemptionDescription' + langIndex] === null) {
            tmpPanel.children[0].style.display = 'none';
        }
        else {
            tmpPanel.children[0].style.display = '';
            tmpPanel.children[0].innerHTML = gpData['TicketRedemptionDescription' + langIndex];
        }
        tmpPanel.querySelector('[data-display-field=TicketTypes]').style.display = (Number(gpData.ShowTicketTypes) === 1 ? '' : 'none');
        tmpPanel.querySelector('[data-display-field=TicketRedemptionStatus]').style.display = (Number(gpData.ShowTicketRedemptionStatus) === 1 ? '' : 'none');
        tmpPanel.querySelector('[data-display-field=TicketRedemptionDate]').style.display = (Number(gpData.ShowTicketRedemptionDate) === 1 ? '' : 'none');
    }
    //#endregion
    //#region Hospitality Panel
    tmpPanel = gpCard.querySelector('[data-display-field=Hospitality]');
    if (Number(gpData.DisplayHospitality) === 0) {
        tmpPanel.parentElement.style.display = 'none';
    }
    else {
        tmpPanel.parentElement.style.display = '';
        tmpPanel.previousElementSibling.innerText = gpData['HospitalityTitle' + langIndex];
        if (gpData['HospitalityDescription' + langIndex] === '' || gpData['HospitalityDescription' + langIndex] === null) {
            tmpPanel.children[0].style.display = 'none';
        }
        else {
            tmpPanel.children[0].style.display = '';
            tmpPanel.children[0].innerHTML = gpData['HospitalityDescription' + langIndex];
        }
        tmpPanel.querySelector('[data-display-field=HospitalityType]').style.display = (Number(gpData.ShowHospitalityType) === 1 ? '' : 'none');
        tmpPanel.querySelector('[data-display-field=HospitalityDate]').style.display = (Number(gpData.ShowHospitalityDate) === 1 ? '' : 'none');
    }
    //#endregion
    //#region Gift Redemption Panel
    tmpPanel = gpCard.querySelector('[data-display-field=GiftRedemption]');
    if (Number(gpData.DisplayGiftRedemption) === 0) {
        tmpPanel.parentElement.style.display = 'none';
    }
    else {
        tmpPanel.parentElement.style.display = '';
        tmpPanel.previousElementSibling.innerText = gpData['GiftRedemptionTitle' + langIndex];
        if (gpData['GiftRedemptionDescription' + langIndex] === '' || gpData['GiftRedemptionDescription' + langIndex] === null) {
            tmpPanel.children[0].style.display = 'none';
        }
        else {
            tmpPanel.children[0].style.display = '';
            tmpPanel.children[0].innerHTML = gpData['GiftRedemptionDescription' + langIndex];
        }
        tmpPanel.querySelector('[data-display-field=GiftRedemptionType]').style.display = (Number(gpData.ShowGiftTypes) === 1 ? '' : 'none');
        tmpPanel.querySelector('[data-display-field=GiftRedemptionStatus]').style.display = (Number(gpData.ShowGiftRedemptionStatus) === 1 ? '' : 'none');
        tmpPanel.querySelector('[data-display-field=GiftRedemptionDate]').style.display = (Number(gpData.ShowGiftRedemptionDate) === 1 ? '' : 'none');
    }
    //#endregion
    //#region Accommodation Panel
    tmpPanel = gpCard.querySelector('[data-display-field=Accomodation]');
    if (Number(gpData.DisplayAccomodation) === 0) {
        tmpPanel.parentElement.style.display = 'none';
    }
    else {
        tmpPanel.parentElement.style.display = '';
        tmpPanel.previousElementSibling.innerText = gpData['AccomodationTitle' + langIndex];
        if (gpData['AccomodationDescription' + langIndex] === '' || gpData['AccomodationDescription' + langIndex] === null) {
            tmpPanel.children[0].style.display = 'none';
        }
        else {
            tmpPanel.children[0].style.display = '';
            tmpPanel.children[0].innerHTML = gpData['AccomodationDescription' + langIndex];
        }
    }
    //#endregion
    //#region Entertainment Panel
    tmpPanel = gpCard.querySelector('[data-display-field=Entertainment]');
    if (Number(gpData.DisplayEntertainment) === 0) {
        tmpPanel.parentElement.style.display = 'none';
    }
    else {
        tmpPanel.parentElement.style.display = '';
        tmpPanel.previousElementSibling.innerText = gpData['EntertainmentTitle' + langIndex];
        if (gpData['EntertainmentDescription' + langIndex] === '' || gpData['EntertainmentDescription' + langIndex] === null) {
            tmpPanel.children[0].style.display = 'none';
        }
        else {
            tmpPanel.children[0].style.display = '';
            tmpPanel.children[0].innerHTML = gpData['EntertainmentDescription' + langIndex];
        }
    }
    //#endregion
    //#region Host Panel
    tmpPanel = gpCard.querySelector('[data-display-field=Host]');
    if (Number(gpData.DisplayHost) === 0) {
        tmpPanel.parentElement.style.display = 'none';
    }
    else {
        tmpPanel.parentElement.style.display = '';
        tmpPanel.previousElementSibling.innerText = gpData['HostTitle' + langIndex];
        if (gpData['HostDescription' + langIndex] === '' || gpData['HostDescription' + langIndex] === null) {
            tmpPanel.children[0].style.display = 'none';
        }
        else {
            tmpPanel.children[0].style.display = '';
            tmpPanel.children[0].innerHTML = gpData['HostDescription' + langIndex];
        }
        tmpPanel.children[1].children[0].style.display = (Number(gpData.ShowHostName) === 0 ? 'none' : '');
        tmpPanel.children[1].children[1].style.display = (Number(gpData.ShowHostPhoto) === 0 ? 'none' : '');
    }
    //#endregion
    //#endregion
    //#region Set Data from API  (再根據API來的資料再設定一次相關欄位的資料))
    var gpCardList = gpPage.querySelector('#GuestPack_CardList');
    [...gpCardList.children].forEach(function (elem) {
        if (elem != gpCardList.lastElementChild) { elem.remove(); }
    });
    gpCardList.lastElementChild.style.transform = 'translate(0px, 0px)';
    gpCardList.lastElementChild.style.zIndex = (51).toString();
    gpCardList.lastElementChild.classList.remove('card_active');
    for (var i = 0; i < guestPackData.length; i++) {
        if (i > 0) {
            gpCardList.insertAdjacentElement('afterbegin', gpCardList.lastElementChild.cloneNode(true));
        }
    }
    var tmpTop = 0, tmpZIndex = 0;
    [...gpCardList.children].forEach(function (elem, index) {
        if (index === 0) {
            tmpTop = Number(elem.style.transform.replace('translate(0px, ', '').replace('px)', ''));
            tmpZIndex = Number(elem.style.zIndex);
        }
        else {
            tmpTop += 60;
            tmpZIndex++;
            elem.style.transform = 'translate(0px, ' + tmpTop.toString() + 'px)';
            elem.style.zIndex = tmpZIndex.toString();
        }
    });
    gpCardList.lastElementChild.classList.add('card_active');
    //
    var count = gpCardList.children.length - 1;
    var ul = Common.getEventLangCode(document.getElementById('G_EventId').value);
    guestPackData.forEach(function (obj, index) {
        //guest
        tmpPanel = gpCardList.children[count].querySelector('[data-display-field=GuestName]');
        tmpPanel.querySelector('h1').children[0].innerText = obj.Name;
        if (Number(obj.Type) === 0) {
            tmpPanel.querySelector('img').src = 'image/icon_guest.fw.png';
            tmpPanel.querySelector('h1').children[1].innerText = '';
        }
        else {
            tmpPanel.querySelector('img').src = 'image/icon_guest_plus.fw.png';
            if (obj.Relationship === '') {
                tmpPanel.querySelector('h1').children[1].innerText = '';
            }
            else {
                tmpPanel.querySelector('h1').children[1].innerText = ' (' + obj.Relationship + ')';
            }
        }
        //qr code
        tmpPanel = gpCardList.children[count].querySelector('[data-display-field=QRCode]');
        QrCodeWithLogo.toCanvas({
            canvas: tmpPanel.querySelector('canvas'),
            content: obj.QRCode,
            width: Math.round(window.innerWidth * 0.7),
            errorCorrectionLevel: 'H',
            logo: { src: 'image/qr_hsbc_logo_color539.fw.png', bgColor: 'transparent' }
        });
        //ticket redemption
        tmpPanel = gpCardList.children[count].querySelector('[data-display-field=TicketRedemption]');
        var tmpHtml = '';
        obj.TicketList.forEach(function (tic) {
            if (tmpHtml !== '') { tmpHtml += '<br />' }
            tmpHtml += tic.LName;
        });
        tmpPanel.querySelector('[data-display-field=TicketTypes]').children[1].innerHTML = tmpHtml;
        tmpPanel.querySelector('[data-display-field=TicketRedemptionDate]').children[1].innerText = obj.TicketRedeemedDate;
        var imageTicketRedeemedStatus = (Number(obj.TicketRedeemedStatus) === 1 ? 'icon_correct.fw.png' : 'icon_wrong.fw.png');
        tmpPanel.querySelector('[data-display-field=TicketRedemptionStatus]').children[1].src = 'image/' + imageTicketRedeemedStatus;
        var ticketRedeemedStatus = (Number(obj.TicketRedeemedStatus) === 1 ? lang[ul].guest_packget.redeemed : lang[ul].guest_packget.no_redeemed);
        tmpPanel.querySelector('[data-display-field=TicketRedemptionStatus]').children[2].innerText = ticketRedeemedStatus;
        //Hospitality
        tmpPanel = gpCardList.children[count].querySelector('[data-display-field=Hospitality]');
        tmpPanel.querySelector('[data-display-field=HospitalityType]').children[1].innerText = obj.Hospitality.Name;
        tmpHtml = '';
        obj.TicketList.forEach(function (tic) {
            if (tmpHtml !== '') { tmpHtml += '<br />' }
            tmpHtml += tic.SName;
        });
        tmpPanel.querySelector('[data-display-field=HospitalityDate]').children[1].innerHTML = tmpHtml;
        //Gift Redemption
        tmpPanel = gpCardList.children[count].querySelector('[data-display-field=GiftRedemption]');
        if (tmpPanel.parentElement.style.display !== 'none') {
            if (obj.Gift === null) {
                tmpPanel.parentElement.style.display = 'none';
            }
            else {
                tmpPanel.parentElement.style.display = '';
                tmpPanel.querySelector('[data-display-field=GiftRedemptionType]').children[1].innerText = obj.Gift.Name;
                tmpPanel.querySelector('[data-display-field=GiftRedemptionDate]').children[1].innerText = obj.Gift.RedeemedDate;
                var imageGiftRedeemedStatus = (Number(obj.Gift.Status) === 1 ? 'icon_correct.fw.png' : 'icon_wrong.fw.png');
                tmpPanel.querySelector('[data-display-field=GiftRedemptionStatus]').children[1].src = 'image/' + imageGiftRedeemedStatus;
                var giftRedeemedStatus = (Number(obj.Gift.Status) === 1 ? lang[ul].guest_packget.redeemed : lang[ul].guest_packget.no_redeemed);
                tmpPanel.querySelector('[data-display-field=GiftRedemptionStatus]').children[2].innerText = giftRedeemedStatus;
            }
        }
        //Accomodation
        tmpPanel = gpCardList.children[count].querySelector('[data-display-field=Accomodation]');
        if (tmpPanel.parentElement.style.display !== 'none') {
            if (obj.Accommodation === null || (obj.Accommodation.Checkin === '' && obj.Accommodation.Checkout === '')) {
                tmpPanel.parentElement.style.display = 'none';
            }
            else {
                tmpPanel.parentElement.style.display = '';
                tmpPanel.children[1].children[0].children[1].innerText = obj.Accommodation.Checkin;
                tmpPanel.children[1].children[1].children[1].innerText = obj.Accommodation.Checkout;
            }
        }
        //Entertainment
        tmpPanel = gpCardList.children[count].querySelector('[data-display-field=Entertainment]');
        if (tmpPanel.parentElement.style.display !== 'none') {
            if (obj.EntertainmentList === null || obj.EntertainmentList.length === 0) {
                tmpPanel.parentElement.style.display = 'none';
            }
            else {
                tmpPanel.parentElement.style.display = '';
                tmpHtml = '';
                obj.EntertainmentList.forEach(function (ente) {
                    tmpHtml += '<div class="bg_div"><p class="fontsize90per marginbottom0px margintop0px">' + ente.Name + '</p></div>'
                });
                tmpPanel.children[1].innerHTML = tmpHtml;
            }
        }
        //Host
        tmpPanel = gpCardList.children[count].querySelector('[data-display-field=Host]');
        if (tmpPanel.parentElement.style.display !== 'none') {
            if (obj.Host.Name === '' && obj.Host.Photo === '') {
                tmpPanel.parentElement.style.display = 'none';
            }
            else {
                tmpPanel.parentElement.style.display = '';
                if (obj.Host.Name === '') {
                    tmpPanel.children[1].children[0].style.display = 'none';
                }
                else {
                    tmpPanel.children[1].children[0].style.display = '';
                    tmpPanel.children[1].children[0].innerText = obj.Host.Name;
                }
                if (obj.Host.Photo === '') {
                    tmpPanel.children[1].children[1].style.display = 'none';
                }
                else {
                    tmpPanel.children[1].children[1].style.display = '';
                    tmpPanel.children[1].children[1].children[0].src = obj.Host.Photo;
                }
            }
        }
        //
        count--;
    });
    //#endregion
    //#region Hide all panel
    gpPage.querySelectorAll('button.accordion').forEach(function (btnElem) {
        btnElem.nextElementSibling.style.display = 'none';
        btnElem.classList.remove('active');
    });
    //#endregion
    Common.openPage('GuestPack');
    history.pushState('GuestPackTab', null, 'main.html#GuestPack');
    document.getElementById('G_NowPage').value = 'GuestPackTab';
    document.getElementById('G_FloatingPage').value = '';
    setTimeout(function () { resetGuestPackContentHeight(); }, 500);
}

var gotoPageFromNav = function (nav) {
    if (nav === 'Home') {
        if (nav !== document.getElementById('G_NowPage').value.replace('Tab', '')) {
            gotoHomeTabPage();
        }
    }
    else if (nav === 'GuestPack') {
        if (nav !== document.getElementById('G_NowPage').value.replace('Tab', '')) {
            gotoGuestPackTab();
        }
    }
    else {
        if (nav !== document.getElementById('ContentTab').dataset.nav) {
            gotoContentTabPage(nav);
        }
    }
};
//#endregion

//#region [ Floating Page ]
var showSettingPage = function (action, withAnimation) {
    if (typeof action === 'undefined') { action = true; }
    if (typeof withAnimation === 'undefined') { withAnimation = true; }
    var nowPage = document.getElementById(document.getElementById('G_NowPage').value);
    var settingPage = document.getElementById('Setting');
    Common.setUILanguage('setting', 'Setting');
    //set content
    if (action) {
        var root = settingPage.querySelector('div.content');
        var tmp = root.children[0].outerHTML;
        root.innerHTML = '';
        var validEvents = getValidEvents();
        validEvents.forEach(function (obj, index) {
            var langIndex = Common.getLangIndex(obj);
            root.insertAdjacentHTML('beforeend', tmp);
            root.lastElementChild.dataset.eventId = obj.Id;
            //titel
            //root.children[index].querySelector('h3').innerHTML = obj['ShortTitle' + Common.getLangIndex(obj)];
            //language switch
            var switchElem = root.children[index].querySelector('div.switch-field');
            var switchTmp = switchElem.children[0].outerHTML + switchElem.children[1].outerHTML;
            switchElem.innerHTML = '';
            var keys = Object.keys(obj).filter(function (lan) { return /^Language[1-2]{1}$/.test(lan); });
            keys.forEach(function (key, ki) {
                if (obj[key] !== '') {
                    switchElem.insertAdjacentHTML('beforeend', switchTmp);
                    var rb = switchElem.querySelectorAll('input[type=radio]')[ki];
                    //radio
                    rb.id = 'Setting_' + obj.Code + '_Lang_' + ki.toString();
                    rb.name = 'Setting_' + obj.Code + '_Lang';
                    rb.value = obj[key];
                    rb.dataset.eventId = obj.Id;
                    rb.checked = (rb.value === Common.getEventLangCode(obj.Id));
                    //label
                    var lab = switchElem.querySelectorAll('label')[ki];
                    lab.setAttribute('for', 'Setting_' + obj.Code + '_Lang_' + ki.toString());
                    lab.innerText = Common.getLanguageDisplayName(obj[key]);
                }
            });
            //notification
            if (obj.EnableNotifcation.toString() === '1') {
                root.children[index].querySelector('label.md_switch').parentElement.style.display = '';
            }
            else {
                root.children[index].querySelector('label.md_switch').parentElement.style.display = 'none';
            }
            var cb = root.children[index].querySelector('label.md_switch').querySelector('input[type=checkbox]');
            checkNotificationPushSetting();
            var notiData = JSON.parse(localStorage.getItem('Notifications'));
            cb.dataset.eventId = obj.Id;
            //console.log(notiData.filter(function (nd) { return nd.EventId.toString() === cb.dataset.eventId.toString(); })[0]);
            cb.checked = (notiData.filter(function (nd) { return nd.EventId.toString() === cb.dataset.eventId.toString(); })[0].AppOn === 'Yes');
        });
        var ul = Common.getUILang();
        [...root.children].forEach(function (divElem) {
            var eventData = validEvents.filter(function (obj) { return Number(obj.Id) === Number(divElem.dataset.eventId); })[0];
            var langIndex = Common.getLangIndex(eventData, ul);
            divElem.querySelector('h3').innerHTML = eventData['ShortTitle' + langIndex];
        });
    }
    //anination
    if (action) {
        lockScreen(true);
        settingPage.style.display = '';
        if (withAnimation) {
            settingPage.classList.add('animated', 'slideInUp', 'faster');
            settingPage.addEventListener('animationend', function (e) {
                nowPage.style.display = 'none';
                e.target.classList.remove('animated', 'slideInUp', 'faster');
                lockScreen(false);
            }, { once: true });
        }
        else {
            nowPage.style.display = 'none';
            lockScreen(false);
        }
        document.getElementById('G_FloatingPage').value = 'Setting';
        history.pushState('Setting', null, 'main.html#Setting');
    }
    else {
        lockScreen(true);
        nowPage.style.display = '';
        if (withAnimation) {
            settingPage.classList.add('animated', 'slideOutDown', 'faster');
            settingPage.addEventListener('animationend', function (e) {
                settingPage.style.display = 'none';
                e.target.classList.remove('animated', 'slideOutDown', 'faster');
                lockScreen(false);
            }, { once: true });
        }
        else {
            settingPage.style.display = 'none';
            lockScreen(false);
        }
        document.getElementById('G_FloatingPage').value = '';
        history.replaceState(document.getElementById('G_NowPage').value, null, 'main.html#' + document.getElementById('G_NowPage').value);
    }
};

var showNewsDetailPage = function (elem, action, withAnimation) {
    if (typeof action === 'undefined') { action = true; }
    if (typeof withAnimation === 'undefined') { withAnimation = true; }
    var nowPage = document.getElementById(document.getElementById('G_NowPage').value);
    var newsPage = document.getElementById('NewsDetail');
    //set content
    newsPage.dataset.newsId = (elem === null ? '' : (typeof elem.dataset.newsId === 'undefined' ? '' : elem.dataset.newsId));
    if (newsPage.dataset.newsId !== '') {
        var eventData = db.Events.filter(function (obj) { return obj.Id.toString() === document.getElementById('G_EventId').value; })[0];
        var langIndex = Common.getLangIndex(eventData);
        var news = eventData.HomeTab.NewsList.filter(function (obj) { return obj.Id.toString() === newsPage.dataset.newsId; })[0];
        newsPage.querySelector('.header_title').innerHTML = eventData['ShortTitle' + langIndex];
        newsPage.querySelector('#NewsDetail_Headline').innerHTML = news['Headline' + langIndex];
        if (news.MainImage === '') {
            newsPage.querySelector('#NewsDetail_MainImage').style.display = 'none';
        }
        else {
            if (Common.useOnlineData) {
                newsPage.querySelector('#NewsDetail_MainImage').src = Common.getServerImagePath(eventData.Code) + news.MainImage;
            }
            else {
                newsPage.querySelector('#NewsDetail_MainImage').src = 'data/' + eventData.Code + '/EventApp/' + eventData.ImageUsedFolder + '/' + news.MainImage;
            }
            newsPage.querySelector('#NewsDetail_MainImage').style.display = '';
        }
        newsPage.querySelector('#NewsDetail_PublishDate').innerHTML = Common.getDateString('NewsDate', eventData.Id, news.PublishDate);
        newsPage.querySelector('#NewsDetail_ArticleBody').innerHTML = news['ArticleBody' + langIndex];
        //
        newsContent = newsPage.querySelector('#NewsDetail_ArticleBody');
        [...newsContent.querySelectorAll('a')].forEach(function (elem) {
            elem.setAttribute('onclick', 'processLinkAction(this); return false;');
        });
    }
    //animation
    if (action) {
        removePushNotification(document.getElementById('G_EventId').value, newsPage.dataset.newsId);
        lockScreen(true);
        newsPage.style.display = '';
        if (withAnimation) {
            newsPage.classList.add('animated', 'slideInRight', 'faster');
            newsPage.addEventListener('animationend', function (e) {
                nowPage.style.display = 'none';
                e.target.classList.remove('animated', 'slideInRight', 'faster');
                lockScreen(false);
                document.getElementById('NewsDetail').scrollTop = 0;
            }, { once: true });
        }
        else {
            nowPage.style.display = 'none';
            lockScreen(false);
            document.getElementById('NewsDetail').scrollTop = 0;
        }
        document.getElementById('G_FloatingPage').value = 'NewsDetail';
        history.pushState('NewsDetail', null, 'main.html#NewsDetail');
    }
    else {
        lockScreen(true);
        nowPage.style.display = '';
        if (withAnimation) {
            newsPage.classList.add('animated', 'slideOutRight', 'faster');
            newsPage.addEventListener('animationend', function (e) {
                newsPage.style.display = 'none';
                e.target.classList.remove('animated', 'slideOutRight', 'faster');
                lockScreen(false);
            }, { once: true });
        }
        else {
            newsPage.style.display = 'none';
            lockScreen(false);
        }
        document.getElementById('G_FloatingPage').value = '';
        history.replaceState(document.getElementById('G_NowPage').value, null, 'main.html#' + document.getElementById('G_NowPage').value);
    }
};

var showContactPage = function (action, withAnimation) {
    if (typeof action === 'undefined') { action = true; }
    if (typeof withAnimation === 'undefined') { withAnimation = true; }
    var nowPage = document.getElementById(document.getElementById('G_NowPage').value);
    var contactPage = document.getElementById('Contact');
    //set content
    getContentTabData(document.getElementById('G_EventId').value, 'Contact', 'Contact');
    Common.setUILanguage('contact', 'Contact', document.getElementById('G_EventId').value);
    //anination
    if (action) {
        lockScreen(true);
        contactPage.style.display = '';
        if (withAnimation) {
            contactPage.classList.add('animated', 'slideInUp', 'faster');
            contactPage.addEventListener('animationend', function (e) {
                nowPage.style.display = 'none';
                e.target.classList.remove('animated', 'slideInUp', 'faster');
                lockScreen(false);
            }, { once: true });
        }
        else {
            nowPage.style.display = 'none';
            lockScreen(false);
        }
        document.getElementById('G_FloatingPage').value = 'Contact';
        history.pushState('Contact', null, 'main.html#Contact');
    }
    else {
        lockScreen(true);
        nowPage.style.display = '';
        if (withAnimation) {
            contactPage.classList.add('animated', 'slideOutDown', 'faster');
            contactPage.addEventListener('animationend', function (e) {
                contactPage.style.display = 'none';
                e.target.classList.remove('animated', 'slideOutDown', 'faster');
                lockScreen(false);
            }, { once: true });
        }
        else {
            contactPage.style.display = 'none';
            lockScreen(false);
        }
        document.getElementById('G_FloatingPage').value = '';
        history.replaceState(document.getElementById('G_NowPage').value, null, 'main.html#' + document.getElementById('G_NowPage').value);
    }
};
//#endregion

//#region [ Notification ]
var checkNotificationPushSetting = function () {
    var notiData = [];
    var validEvents = getValidEvents();
    if (localStorage.getItem('Notifications') === null) {
        validEvents.forEach(function (obj) {
            notiData.push({
                "EventId": obj.Id,
                "AppOn": (obj.EnableNotifcation == 1 ? 'Yes' : 'No'),
                "ServerOn": (obj.EnableNotifcation == 1 ? 'No' : 'No'),
                "AppLangIndex": Number(Common.getLangIndex(obj)),
                "ServerLangIndex": 1
            });
        });
        localStorage.setItem('Notifications', JSON.stringify(notiData));
    }
    else {
        notiData = JSON.parse(localStorage.getItem('Notifications'));
        validEvents.forEach(function (obj) {
            if (notiData.filter(function (nd) { return Number(obj.Id) === Number(nd.EventId); }).length === 0) {
                notiData.push({
                    "EventId": obj.Id,
                    "AppOn": (obj.EnableNotifcation == 1 ? 'Yes' : 'No'),
                    "ServerOn": (obj.EnableNotifcation == 1 ? 'No' : 'No'),
                    "AppLangIndex": Number(Common.getLangIndex(obj)),
                    "ServerLangIndex": 1
                });
            }
        });
        localStorage.setItem('Notifications', JSON.stringify(notiData));
    }
    notiData = JSON.parse(localStorage.getItem('Notifications')); // EventID < 0 是給審核人員看的資料不需要推播
    if (__notificationToken !== '' && (
        notiData.filter(function (obj) { return (obj.AppOn !== obj.ServerOn && Number(obj.EventId) > 0); }).length > 0 ||
        notiData.filter(function (obj) { return (obj.AppLangIndex !== obj.ServerLangIndex && Number(obj.EventId) > 0); }).length > 0)) {
        var ajaxQueue = [];
        notiData.forEach(function (obj) {
            ajaxQueue.push(axios.post(Common.urlInfo.notification, {
                EventId: obj.EventId,
                NotiToken: __notificationToken,
                SwitchOn: obj.AppOn,
                OS: __deviceInfo.OS,
                LangIndex: obj.AppLangIndex
            }));
        });
        axios.all(ajaxQueue).then(function (allRes) {
            allRes.forEach(function (res) {
                if (res.data.Result === 'success') {
                    var i = notiData.findIndex(function (obj) {
                        return (Number(obj.EventId) === Number(res.data.EventId));
                    });
                    notiData[i].ServerOn = notiData[i].AppOn;
                    notiData[i].ServerLangIndex = notiData[i].AppLangIndex;
                }
            });
            localStorage.setItem('Notifications', JSON.stringify(notiData));
        }).finally(function () {
            setTimeout(checkNotificationPushSetting, check_notification_setting_time_interval);
        });
    }
}
//#endregion

//#region [ Page Event Function ]
var setEventLang = function (elem) {
    var eventId = elem.dataset.eventId;
    var eventLangSetting = [];
    if (localStorage.getItem('EventLangs') !== null) {
        eventLangSetting = JSON.parse(localStorage.getItem('EventLangs'));
    }
    var els = eventLangSetting.filter(function (obj) { return Number(obj.Id) === Number(eventId); });
    if (els.length > 0) {
        for (var i = 0; i < eventLangSetting.length; i++) {
            if (Number(eventLangSetting[i].Id) === Number(eventId)) {
                eventLangSetting[i].Lang = elem.value;
                break;
            }
        }
    }
    else {
        eventLangSetting.push({ "Id": eventId, "Lang": elem.value });
    }
    localStorage.setItem('EventLangs', JSON.stringify(eventLangSetting));
    var rootElem = elem.closest('div.paddinglr15');
    //change setting page language
    var root = elem.closest('.content');
    var events = getValidEvents();
    var ul = Common.getUILang();
    [...root.children].forEach(function (divElem) {
        var eventData = events.filter(function (obj) { return Number(obj.Id) === Number(divElem.dataset.eventId); })[0];
        var langIndex = Common.getLangIndex(eventData, ul);
        divElem.querySelector('h3').innerHTML = eventData['ShortTitle' + langIndex];
    });
    Common.setUILanguage('setting', 'Setting');
    //change tab language
    if (['EventList', 'HomeTab', 'ContentTab'].includes(document.getElementById('G_NowPage').value)) {
        if (document.getElementById('G_NowPage').value === 'EventList') {
            Common.setUILanguage('event_list', 'EventList');
        }
        else if (document.getElementById('G_NowPage').value === 'HomeTab') {
            getHomeTabData(document.getElementById('G_EventId').value);
        }
        else {
            getContentTabData(document.getElementById('G_EventId').value, document.getElementById('ContentTab').dataset.nav);
        }
    }
};

var setEventNotification = function (elem) {
    var eventId = elem.dataset.eventId;
    var eventData = getValidEvents().filter(function (obj) { return Number(obj.Id) === Number(eventId); })[0];
    var notiSetting = [];
    if (localStorage.getItem('Notifications') !== null) {
        notiSetting = JSON.parse(localStorage.getItem('Notifications'));
    }
    var nss = notiSetting.filter(function (obj) { return Number(obj.EventId) === Number(eventId); });
    if (nss.length > 0) {
        for (var i = 0; i < nss.length; i++) {
            if (elem.dataset.field === 'lang') {
                nss[i].AppLangIndex = Number(Common.getLangIndex(eventData));
            }
            else {
                nss[i].AppOn = (elem.checked ? 'Yes' : 'No');
            }
        }
    }
    else {
        if (elem.dataset.field === 'lang') {
            notiSetting.push({
                "EventId": eventData.Id,
                "AppOn": (eventData.EnableNotifcation == 1 ? 'Yes' : 'No'),
                "ServerOn": 'No',
                "AppLangIndex": Number(Common.getLangIndex(eventData)),
                "ServerLangIndex": 1
            });
        }
        else {
            notiSetting.push({
                "EventId": eventData.Id,
                "AppOn": (elem.checked ? 'Yes' : 'No'),
                "ServerOn": 'No',
                "AppLangIndex": Number(Common.getLangIndex(eventData)),
                "ServerLangIndex": 1
            });
        }
    }
    localStorage.setItem('Notifications', JSON.stringify(notiSetting));
    checkNotificationPushSetting();
};

var swapActiveCard = function (elem) {
    if (!elem.parentElement.classList.contains('card_active')) {
        var root = elem.parentElement.parentElement;
        var sourceElem = elem.parentElement;
        var activeElem = [...root.children].filter(function (el) { return el.classList.contains('card_active'); })[0];
        if (activeElem.querySelector('button.accordion.active')) {
            activeElem.querySelector('button.accordion.active').onclick();
        }
        //animation setting
        var sourceTop = Number(sourceElem.style.transform.replace('translate(0px, ', '').replace('px)', ''));
        var activeTop = Number(activeElem.style.transform.replace('translate(0px, ', '').replace('px)', ''));
        var tmpOffsetTop = (sourceTop - activeTop);
        var tmpZIndex = sourceElem.style.zIndex;
        //start animation
        if (tmpOffsetTop < 0) {
            sourceElem.style.transform = 'translate(0px, ' + (sourceTop + (tmpOffsetTop * -1)).toString() + 'px)';
            activeElem.style.transform = 'translate(0px, ' + (activeTop - (tmpOffsetTop * -1)).toString() + 'px)';
        }
        else {
            sourceElem.style.transform = 'translate(0px, ' + (sourceTop - tmpOffsetTop).toString() + 'px)';
            activeElem.style.transform = 'translate(0px, ' + (activeTop + tmpOffsetTop).toString() + 'px)';
        }
        sourceElem.style.zIndex = activeElem.style.zIndex;
        activeElem.style.zIndex = tmpZIndex;
        activeElem.classList.remove('card_active');
        sourceElem.classList.add('card_active');
    }
};

var showAccordion = function (elem) {
    var root = elem.parentElement.parentElement;
    elem.classList.toggle('active');
    root.querySelectorAll('button.accordion').forEach(function (btnElem) {
        if (btnElem === elem) {
            if (btnElem.classList.contains('active')) {
                btnElem.nextElementSibling.style.display = '';
            }
            else {
                btnElem.nextElementSibling.style.display = 'none';
            }
        }
        else {
            btnElem.classList.remove('active');
            btnElem.nextElementSibling.style.display = 'none';
        }
    });
    resetGuestPackContentHeight();
};

var processLinkAction = function (elem) {
    if (__deviceInfo.OS.toLowerCase() === 'android') {
        android.openBrowserInApp(elem.href);
    }
    else if (__deviceInfo.OS.toLowerCase() === 'ios') {
        webkit.messageHandlers.openBrowserInApp.postMessage(elem.href);
    }
    else {
        window.open(elem.href, '_blank');
    }
};
//#endregion

//#region [ Utility Functions ]
var lockScreen = function (lock) {
    if (document.getElementById('UILockScreen') === null) {
        var htmlTmp = '<div id="UILockScreen" style="background-color: transparent; position: absolute; z-index: 21; top: 0px; left: 0px; ';
        htmlTmp += 'width: 100vw; height: 100vh; display: none;"></div>';
        document.querySelector('body').insertAdjacentHTML('beforeend', htmlTmp);
    }
    if (lock) {
        document.getElementById('UILockScreen').style.display = '';
    }
    else {
        document.getElementById('UILockScreen').style.display = 'none';
    }
};

var getValidEvents = function () {
    var events = db.Events.filter(function (obj) {
        if (Number(obj.Id) < 0) {
            return true;
        }
        else {
            if (Number(obj.Id) !== 0 && obj.HomeTab !== null && obj.InfoTab !== null && obj.ItineraryTab !== null
                && obj.HospitalityTab !== null && obj.ContactTab !== null && obj.GuestPackge !== null) {
                var todayDate = moment().utc().add(Number(obj.TimeZone), 'minute').format('YYYYMMDD');
                var startDate = moment(obj.StartDate).utc().add(Number(obj.TimeZone), 'minute').format('YYYYMMDD');
                var endDate = moment(obj.EndDate).utc().add(Number(obj.TimeZone), 'minute').format('YYYYMMDD');
                return (Number(todayDate) >= Number(startDate) && Number(todayDate) <= Number(endDate));
            }
            else {
                return false;
            }
        }
    });
    //init event languages
    var el;
    if (localStorage.getItem('EventLangs') === null) {
        el = [];
        events.forEach(function (event) {
            el.push({ 'Id': event.Id.toString(), 'Lang': event.Language1 });
        });
    }
    else {
        el = JSON.parse(localStorage.getItem('EventLangs'));
        events.forEach(function (event) {
            if (el.filter(function (obj) { return Number(obj.Id) === Number(event.Id); }).length === 0) {
                el.push({ 'Id': event.Id.toString(), 'Lang': event.Language1 });
            }
        });
    }
    el = el.map(function (obj) {
        if (events.filter(function (obj2) { return Number(obj.Id) === Number(obj2.Id); }).length > 0) {
            return obj;
        }
    });
    localStorage.setItem('EventLangs', JSON.stringify(el));
    //init popup notice
    var pn;
    if (localStorage.getItem('PopupNotice') === null) {
        pn = [];
        events.forEach(function (event) {
            if (event.PopupNotice != null) {
                pn.push({ 'Id': event.Id.toString(), 'Status': 0 });
            }
        });
    }
    else {
        pn = JSON.parse(localStorage.getItem('PopupNotice'));
        events.forEach(function (event) {
            if (pn.filter(function (obj) { return Number(obj.Id) === Number(event.Id); }).length === 0) {
                if (event.PopupNotice != null) {
                    pn.push({ 'Id': event.Id.toString(), 'Status': 0 });
                }
            }
        });
    }
    pn = pn.map(function (obj) {
        var event = events.filter(function (obj2) { return Number(obj.Id) === Number(obj2.Id); });
        if (event.length > 0 && event[0].PopupNotice !== null) {
            return obj;
        }
    });
    localStorage.setItem('PopupNotice', JSON.stringify(pn));
    return events;
};

var gotoEventListOrHomeTab = function () {
    var events = getValidEvents();
    localStorage.setItem('HomeFlag', 'HP');
    if (events.length === 1) {
        localStorage.setItem('EventId', events[0].Id);
        gotoHomeTabPageContent();
    }
    else {
        gotoEventListPageContent(true);
    }
};

var downloadZip = function () {
    if (!Common.downloadZipLocked) {
        Common.downloadZipLocked = true;
        axios
            .post(Common.urlInfo.download_db, {
                Token: __activeInfo.token
            })
            .then(function (res) {
                var data = res.data;
                if (data.Result === "success") {
                    var MD5 = "";
                    if (localStorage.getItem("DownloadDbMd5") !== null) {
                        MD5 = localStorage.getItem("DownloadDbMd5");
                    }
                    if (MD5 !== data.MD5) {
                        document.getElementById("tbMD5").value = data.MD5;
                        localStorage.setItem("DownloadDbMd5", document.getElementById("tbMD5").value);
                        if (__deviceInfo.OS.toLowerCase() === "android") {
                            android.downloadZip(data.ZipPath);
                        } else if (__deviceInfo.OS.toLowerCase() === "ios") {
                            webkit.messageHandlers.downloadZip.postMessage(data.ZipPath);
                        } else {
                            console.log("Download Zip Url Async: " + data.ZipPath);
                        }
                    }
                    else {
                        Common.downloadZipLocked = false;
                        localStorage.setItem("DownloadDbMd5", data.MD5);
                    }
                }
                else {
                    Common.downloadZipLocked = false;
                }
            })
            .catch(function (error) {
                if (error.message !== "Network Error") {
                    console.error(error);
                }
                Common.downloadZipLocked = false;
            });
    }
};

var doAfterDownloadZip = function (msg) {
    if (msg === "success") {
        localStorage.setItem("DownloadDbMd5", document.getElementById("tbMD5").value);
    }
    Common.downloadZipLocked = false;
};

var showNewsDetailFromPushNotification = function (eventId, newsId) {
    var ok = true;
    var events = getValidEvents();
    var eventData = events.filter(function (obj) { return Number(obj.Id) === Number(eventId); })[0];
    if (typeof eventData === 'undefined') {
        ok = false;
    }
    else {
        if (eventData.HomeTab.NewsList.filter(function (objNews) { return Number(objNews.Id) === Number(newsId); }).length === 0) {
            ok = false;
        }
    }
    if (ok) {
        document.getElementById('G_EventId').value = eventId;
        gotoHomeTabPageContent();
        var nowPage = document.getElementById(document.getElementById('G_NowPage').value);
        var newsPage = document.getElementById('NewsDetail');
        //set content
        newsPage.dataset.newsId = newsId;
        var langIndex = Common.getLangIndex(eventData);
        var news = eventData.HomeTab.NewsList.filter(function (obj) { return obj.Id.toString() === newsPage.dataset.newsId; })[0];
        newsPage.querySelector('.header_title').innerHTML = eventData['ShortTitle' + langIndex];
        newsPage.querySelector('#NewsDetail_Headline').innerHTML = news['Headline' + langIndex];
        if (news.MainImage === '') {
            newsPage.querySelector('#NewsDetail_MainImage').style.display = 'none';
        }
        else {
            if (Common.useOnlineData) {
                newsPage.querySelector('#NewsDetail_MainImage').src = Common.getServerImagePath(eventData.Code) + news.MainImage;
            }
            else {
                newsPage.querySelector('#NewsDetail_MainImage').src = 'data/' + eventData.Code + '/EventApp/' + eventData.ImageUsedFolder + '/' + news.MainImage;
            }
            newsPage.querySelector('#NewsDetail_MainImage').style.display = '';
        }
        newsPage.querySelector('#NewsDetail_PublishDate').innerHTML = Common.getDateString('NewsDate', eventData.Id, news.PublishDate);
        newsPage.querySelector('#NewsDetail_ArticleBody').innerHTML = news['ArticleBody' + langIndex];
        newsPage.querySelector('header_title')
        //animation
        lockScreen(true);
        newsPage.style.display = '';
        nowPage.style.display = 'none';
        lockScreen(false);
        document.getElementById('G_FloatingPage').value = 'NewsDetail';
        history.pushState('NewsDetail', null, 'main.html#NewsDetail');
    }
    else {
        gotoEventListOrHomeTab();
    }
};

var resetGuestPackContentHeight = function () {
    var rootElem = document.getElementById('GuestPack_CardList');
    var tragetElem = rootElem.firstElementChild;
    [...rootElem.children].forEach(function (elem) {
        if (Number(elem.style.zIndex) > Number(tragetElem.style.zIndex)) {
            tragetElem = elem;
        }
    });
    rootElem.style.height = (tragetElem.offsetTop + tragetElem.offsetHeight + 50).toString() + 'px';
};

var removePushNotification = function (eventId, newsId) {
    if (__deviceInfo.OS.toLowerCase() === 'ios') {
        webkit.messageHandlers.removePushNotification.postMessage(eventId.toString() + ',' + newsId.toString());
    }
};

var showPopupNotice = function (eventId) {
    if (localStorage.getItem('PopupNotice') !== null) {
        var event = getValidEvents().filter(function (obj) { return Number(obj.Id) === Number(eventId); })[0];
        var data = JSON.parse(localStorage.getItem('PopupNotice'));
        data.forEach(function (pn) {
            if (Number(pn.Id) === Number(eventId) && pn.Status === 0) {
                var ok = false;
                if (!ok) {
                    if (moment.tz(event.TimeZone).isAfter(moment.tz(event.PopupNotice.PublishDate, event.TimeZone), 'day')) {
                        ok = true;
                    }
                }
                if (!ok) {
                    if (moment.tz(event.TimeZone).isSame(moment.tz(event.PopupNotice.PublishDate, event.TimeZone), 'day') && moment.tz(event.TimeZone).hour() >= 9) {
                        ok = true;
                    }
                }
                if (ok) {
                    var langIndex = Common.getLangIndex(event);
                    Common.alertMessage(event['PopupNotice']['Message' + langIndex], event['PopupNotice']['Heading' + langIndex]);
                    pn.Status = 1;
                }
            }
        });
        localStorage.setItem('PopupNotice', JSON.stringify(data));
    }
};
//#endregion