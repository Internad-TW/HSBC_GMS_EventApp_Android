var db = {
    "Events": [
        {
            "Id": -1,
            "Code": "event1",
            "ImageUsedFolder": "Uploaded",
            "TimeZone": 'Asia/Taipei',
            "TicketId": "1916",
            "Language1": "en",
            "Language2": "zh-cn",
            "LanguageCode": "en",
            "ServerLanguage1": 5,
            "ServerLanguage2": 0,
            "Title1": "The 148<sup>th</sup> Open at Royal Portrush,",
            "Title2": "中文",
            "ShortTitle1": "The 148<sup>th</sup> Open at Royal Portrush",
            "ShortTitle2": "中文",
            "StartDate": moment().add(-1, 'month').format('YYYY-MM-DD'),
            "EndDate": moment().add(1, 'month').format('YYYY-MM-DD'),
            "EventStartDate": moment().add(-1, 'month').format('YYYY-MM-DD'),
            "EventEndDate": moment().add(1, 'month').format('YYYY-MM-DD'),
            "ListImage": "banner_theopen.jpg",
            "LogoImage1": "logo_theopen.fw.png",
            "LogoImage2": "logo_theopen.fw.png",
            "EnableNotifcation": 0,
            "EnableGuestPackage": 0,
            "HomeTab": {
                "BannerBackgroundImage": "home_theopen.jpg",
                "CountDownClock": 1,
                "CountDownClockTargetDate": moment().add(1, 'month').format('YYYY-MM-DD'),
                "CountDownClockTargetTime": "09:00",
                "CountDownUnitsDay": 1,
                "CountDownUnitsHour": 1,
                "CountDownUnitsMinute": 1,
                "EventNews": 1,
                "NewsList": [
                    {
                        "Id": 1,
                        "Headline1": "HSBC Ambassadors",
                        "Headline2": "",
                        "Summary1": "BRIAN O’DRISCOLL is a former Irish professional Rugby Union player and ...",
                        "Summary2": "",
                        "PublishDate": "\/Date(1564502400000)\/",
                        "ThumbnailImage": "ambassadors-01.jpg",
                        "MainImage": "ambassadors-01-big.jpg",
                        "ArticleBody1": "<p class=\"lineheight135per color_midgray\">For the next 12 months at least, Shane Lowry can call himself Champion Golfer of the Year after a brilliant performance at Royal Portrush to seal The 148th Open.<\/p>\r\n<p class=\"lineheight135per color_midgray\">The Irishman was both a deserving and popular winner \u2013 just ask the fans in attendance, who brought a party atmosphere to the Northern Irish venue that more resembled Glastonbury than golf.<\/p>\r\n<p class=\"lineheight135per color_midgray\">Football chants and pop songs reverberated around the Dunluce Links following a scintillating Saturday that put the 32-year-old in control, before celebrations ratcheted up a notch after he sealed victory on Sunday.<\/p>\r\n<p class=\"lineheight135per color_midgray\">Lowry\u2019s six-stroke victory over Tommy Fleetwood meant he became just the fourth player in the last 50 years \u2013 after Rory McIlroy, Louis Oosthuizen and Tiger Woods \u2013 to clinch his first major by more than five shots, so allow us to tell you the story of how he won the Claret Jug.<\/p>",
                        "ArticleBody2": ""
                    },
                    {
                        "Id": 2,
                        "Headline1": "US Open Preview",
                        "Headline2": "",
                        "Summary1": "Champion Golfers descend on Pebble Beach",
                        "Summary2": "",
                        "PublishDate": "\/Date(1566662400000)\/",
                        "ThumbnailImage": "news-thumb-04.jpg",
                        "MainImage": "news-04.jpg",
                        "ArticleBody1": "<p class=\"lineheight135per color_midgray\">For the next 12 months at least, Shane Lowry can call himself Champion Golfer of the Year after a brilliant performance at Royal Portrush to seal The 148th Open.<\/p>\r\n<p class=\"lineheight135per color_midgray\">The Irishman was both a deserving and popular winner \u2013 just ask the fans in attendance, who brought a party atmosphere to the Northern Irish venue that more resembled Glastonbury than golf.<\/p>\r\n<p class=\"lineheight135per color_midgray\">Football chants and pop songs reverberated around the Dunluce Links following a scintillating Saturday that put the 32-year-old in control, before celebrations ratcheted up a notch after he sealed victory on Sunday.<\/p>\r\n<p class=\"lineheight135per color_midgray\">Lowry\u2019s six-stroke victory over Tommy Fleetwood meant he became just the fourth player in the last 50 years \u2013 after Rory McIlroy, Louis Oosthuizen and Tiger Woods \u2013 to clinch his first major by more than five shots, so allow us to tell you the story of how he won the Claret Jug.<\/p>",
                        "ArticleBody2": ""
                    }
                ]
            },
            "InfoTab": {
                "BannerImage1": "info_theopen.jpg",
                "BannerImage2": "info_theopen.jpg",
                "Title1": "Info",
                "Title2": "資訊",
                "SubSections": [
                    {
                        "Title1": "Text Title",
                        "Title2": "",
                        "ContentType": 1,
                        "Text1": "Content Text Test",
                        "Text2": "Content Text Test"
                    },
                    {
                        "Title1": "Image Title",
                        "Title2": "",
                        "ContentType": 2,
                        "Image1": "info-sample-img02.jpg",
                        "Image2": "info-sample-img02.jpg"
                    }
                ]
            },
            "ItineraryTab": {
                "BannerImage1": "info_theopen.jpg",
                "BannerImage2": "info_theopen.jpg",
                "Title1": "Itinerary",
                "Title2": "",
                "SubSections": [
                    {
                        "Title1": "Text Title",
                        "Title2": "",
                        "ContentType": 1,
                        "Text1": "Content Text Test",
                        "Text2": "Content Text Test"
                    },
                    {
                        "Title1": "Image Title",
                        "Title2": "",
                        "ContentType": 2,
                        "Image1": "info-sample-img02.jpg",
                        "Image2": ""
                    },
                    {
                        "Title1": "Session Title",
                        "Title2": "",
                        "ContentType": 3,
                        "TicketId": 1916,
                        "DisplayScope": 2,
                        "Session": [
                            {
                                "Time1": "09:00 - 10:00",
                                "Time2": "",
                                "Text1": "Breakfast is served",
                                "Text2": ""
                            },
                            {
                                "Time1": "12:00 - 14:00",
                                "Time2": "",
                                "Text1": "Lunch is served",
                                "Text2": ""
                            },
                            {
                                "Time1": "15:00 - 18:00",
                                "Time2": "",
                                "Text1": "Supper is served",
                                "Text2": ""
                            }
                        ]
                    }
                ]
            },
            "HospitalityTab": {
                "BannerImage1": "info_theopen.jpg",
                "BannerImage2": "info_theopen.jpg",
                "Title1": "Hospitality",
                "Title2": "",
                "SubSections": [
                    {
                        "Title1": "Text Title",
                        "Title2": "",
                        "ContentType": 1,
                        "Text1": "Content Text Test",
                        "Text2": "Content Text Test"
                    },
                    {
                        "Title1": "Image Title",
                        "Title2": "",
                        "ContentType": 2,
                        "Image1": "info-sample-img02.jpg",
                        "Image2": ""
                    }
                ]
            },
            "ContactTab": {
                "BannerImage1": "info_theopen.jpg",
                "BannerImage2": "info_theopen.jpg",
                "Title1": "Contact",
                "Title2": "",
                "SubSections": [
                    {
                        "Title1": "Text Title",
                        "Title2": "",
                        "ContentType": 1,
                        "Text1": "Content Text Test",
                        "Text2": "Content Text Test"
                    },
                    {
                        "Title1": "Image Title",
                        "Title2": "",
                        "ContentType": 2,
                        "Image1": "info-sample-img02.jpg",
                        "Image2": ""
                    }
                ]
            },
            "GuestPackage": {
                "Title1": "Event1 Guest Package Title",
                "Title2": "",
                "DisplayQRcode": 1,
                "DisplayGuestName": 1,
                "QRcodeDescription1": "",
                "QRcodeDescription2": "",
                "DisplayTicketRedemption": 1,
                "TicketRedemptionTitle1": "Ticket Redemption Title (English) ",
                "TicketRedemptionTitle2": "",
                "TicketRedemptionDescription1": "\u003cp\u003eTicket Redemption Description (English)\u003c/p\u003e\n",
                "TicketRedemptionDescription2": "",
                "ShowTicketTypes": 1,
                "ShowTicketRedemptionStatus": 1,
                "ShowTicketRedemptionDate": 1,
                "DisplayHospitality": 1,
                "HospitalityTitle1": "Hospitality Title (English) ",
                "HospitalityTitle2": "",
                "HospitalityDescription1": "\u003cp\u003eHospitality Description (English)\u003c/p\u003e\n",
                "HospitalityDescription2": "",
                "ShowHospitalityType": 1,
                "ShowHospitalityDate": 1,
                "DisplayGiftRedemption": 1,
                "GiftRedemptionTitle1": "Gift Redemption Title (English)",
                "GiftRedemptionTitle2": "",
                "GiftRedemptionDescription1": "\u003cp\u003e456\u003c/p\u003e\n",
                "GiftRedemptionDescription2": "",
                "ShowGiftTypes": 1,
                "ShowGiftRedemptionStatus": 1,
                "ShowGiftRedemptionDate": 1,
                "DisplayAccomodation": 1,
                "AccomodationTitle1": "Accomodation Title (English)",
                "AccomodationTitle2": "",
                "AccomodationDescription1": "\u003cp\u003eAccomodation Description (English)\u003c/p\u003e\n",
                "AccomodationDescription2": "",
                "ShowAccomodationType": 1,
                "ShowAccomodationDate": 1,
                "DisplayEntertainment": 1,
                "EntertainmentTitle1": "Entertainment Title (English) ",
                "EntertainmentTitle2": "",
                "EntertainmentDescription1": "\u003cp\u003eEntertainment Description (English)\u003c/p\u003e\n",
                "EntertainmentDescription2": "",
                "ShowEntertainmentType": 1,
                "ShowEntertainmentDate": 1,
                "DisplayHost": 1,
                "HostTitle1": "Host Title (English)",
                "HostTitle2": "",
                "HostDescription1": "\u003cp\u003eHost Description (English)\u003c/p\u003e\n",
                "HostDescription2": "",
                "ShowHostName": 1,
                "ShowHostPhoto": 1
            },
            "PopupNotice": {
                "Heading1": "123",
                "Heading2": "一二三",
                "Message1": "Content",
                "Message2": "內容",
                "PublishDate": "2019-10-30",
                "GUID": "1234"
            }
        },
        {
            "Id": -2,
            "Code": "event2",
            "ImageUsedFolder": "Uploaded",
            "TimeZone": 'Asia/Taipei',
            "TicketId": "",
            "Language1": "en",
            "Language2": "",
            "LanguageCode": "en",
            "ServerLanguage1": 5,
            "ServerLanguage2": 0,
            "Title1": "The Championships, Wimbledon",
            "Title2": "The Championships, Wimbledon",
            "ShortTitle1": "The Championships, Wimbledon",
            "ShortTitle2": "The Championships, Wimbledon",
            "StartDate": moment().add(-1, 'month').format('YYYY-MM-DD'),
            "EndDate": moment().add(1, 'month').format('YYYY-MM-DD'),
            "EventStartDate": moment().add(-1, 'month').format('YYYY-MM-DD'),
            "EventEndDate": moment().add(1, 'month').format('YYYY-MM-DD'),
            "ListImage": "banner_wimbledon.jpg",
            "LogoImage1": "logo_big.fw.png",
            "LogoImage2": "",
            "EnableNotifcation": 0,
            "EnableGuestPackage": 0,
            "HomeTab": {
                "BannerBackgroundImage": "home_theopen.jpg",
                "CountDownClock": 1,
                "CountDownClockTargetDate": moment().add(1, 'month').format('YYYY-MM-DD'),
                "CountDownClockTargetTime": "08:00",
                "CountDownUnitsDay": 1,
                "CountDownUnitsHour": 1,
                "CountDownUnitsMinute": 1,
                "EventNews": 1,
                "NewsList": [
                    {
                        "Id": 1,
                        "Headline1": "McDowell Qualifies",
                        "Headline2": "",
                        "Summary1": "Graeme McDowell will return home to compete at The 148th Open ...",
                        "Summary2": "",
                        "PublishDate": "\/Date(1569340800000)\/",
                        "ThumbnailImage": "news-thumb-02.jpg",
                        "MainImage": "news-02.jpg",
                        "ArticleBody1": "<p class=\"lineheight135per color_midgray\">For the next 12 months at least, Shane Lowry can call himself Champion Golfer of the Year after a brilliant performance at Royal Portrush to seal The 148th Open.<\/p>\r\n<p class=\"lineheight135per color_midgray\">The Irishman was both a deserving and popular winner \u2013 just ask the fans in attendance, who brought a party atmosphere to the Northern Irish venue that more resembled Glastonbury than golf.<\/p>\r\n<p class=\"lineheight135per color_midgray\">Football chants and pop songs reverberated around the Dunluce Links following a scintillating Saturday that put the 32-year-old in control, before celebrations ratcheted up a notch after he sealed victory on Sunday.<\/p>\r\n<p class=\"lineheight135per color_midgray\">Lowry\u2019s six-stroke victory over Tommy Fleetwood meant he became just the fourth player in the last 50 years \u2013 after Rory McIlroy, Louis Oosthuizen and Tiger Woods \u2013 to clinch his first major by more than five shots, so allow us to tell you the story of how he won the Claret Jug.<\/p>",
                        "ArticleBody2": ""
                    },
                    {
                        "Id": 2,
                        "Headline1": "Rory McIlroy",
                        "Headline2": "",
                        "Summary1": "As long as they play golf at Royal Portrush, it is unlikely anyone will go close to matching Rory...",
                        "Summary2": "",
                        "PublishDate": "\/Date(1569772800000)\/",
                        "ThumbnailImage": "news-thumb-03.jpg",
                        "MainImage": "news-03.jpg",
                        "ArticleBody1": "<p class=\"lineheight135per color_midgray\">For the next 12 months at least, Shane Lowry can call himself Champion Golfer of the Year after a brilliant performance at Royal Portrush to seal The 148th Open.<\/p>\r\n<p class=\"lineheight135per color_midgray\">The Irishman was both a deserving and popular winner \u2013 just ask the fans in attendance, who brought a party atmosphere to the Northern Irish venue that more resembled Glastonbury than golf.<\/p>\r\n<p class=\"lineheight135per color_midgray\">Football chants and pop songs reverberated around the Dunluce Links following a scintillating Saturday that put the 32-year-old in control, before celebrations ratcheted up a notch after he sealed victory on Sunday.<\/p>\r\n<p class=\"lineheight135per color_midgray\">Lowry\u2019s six-stroke victory over Tommy Fleetwood meant he became just the fourth player in the last 50 years \u2013 after Rory McIlroy, Louis Oosthuizen and Tiger Woods \u2013 to clinch his first major by more than five shots, so allow us to tell you the story of how he won the Claret Jug.<\/p>",
                        "ArticleBody2": ""
                    }
                ]
            },
            "InfoTab": {
                "BannerImage1": "info_theopen.jpg",
                "BannerImage2": "",
                "Title1": "",
                "Title2": "",
                "SubSections": [
                    {
                        "Title1": "Text Title",
                        "Title2": "",
                        "ContentType": 1,
                        "Text1": "Content Text Test",
                        "Text2": "Content Text Test"
                    },
                    {
                        "Title1": "Image Title",
                        "Title2": "",
                        "ContentType": 2,
                        "Image1": "info-sample-img02.jpg",
                        "Image2": ""
                    }
                ]
            },
            "ItineraryTab": {
                "BannerImage1": "info_theopen.jpg",
                "BannerImage2": "",
                "Title1": "",
                "Title2": "",
                "SubSections": [
                    {
                        "Title1": "Text Title",
                        "Title2": "",
                        "ContentType": 1,
                        "Text1": "Content Text Test",
                        "Text2": "Content Text Test"
                    },
                    {
                        "Title1": "Image Title",
                        "Title2": "",
                        "ContentType": 2,
                        "Image1": "info-sample-img02.jpg",
                        "Image2": ""
                    },
                    {
                        "Title1": "Session Title",
                        "Title2": "",
                        "ContentType": 3,
                        "TicketId": 1916,
                        "DisplayScope": 1,
                        "Session": [
                            {
                                "Time1": "09:00 - 10:00",
                                "Time2": "",
                                "Text1": "Breakfast is served",
                                "Text2": ""
                            },
                            {
                                "Time1": "12:00 - 14:00",
                                "Time2": "",
                                "Text1": "Lunch is served",
                                "Text2": ""
                            },
                            {
                                "Time1": "15:00 - 18:00",
                                "Time2": "",
                                "Text1": "Supper is served",
                                "Text2": ""
                            }
                        ]
                    }
                ]
            },
            "HospitalityTab": {
                "BannerImage1": "info_theopen.jpg",
                "BannerImage2": "",
                "Title1": "",
                "Title2": "",
                "SubSections": [
                    {
                        "Title1": "Text Title",
                        "Title2": "",
                        "ContentType": 1,
                        "Text1": "Content Text Test",
                        "Text2": "Content Text Test"
                    },
                    {
                        "Title1": "Image Title",
                        "Title2": "",
                        "ContentType": 2,
                        "Image1": "info-sample-img02.jpg",
                        "Image2": ""
                    }
                ]
            },
            "ContactTab": {
                "BannerImage1": "info_theopen.jpg",
                "BannerImage2": "",
                "Title1": "",
                "Title2": "",
                "SubSections": [
                    {
                        "Title1": "Text Title",
                        "Title2": "",
                        "ContentType": 1,
                        "Text1": "Content Text Test",
                        "Text2": "Content Text Test"
                    },
                    {
                        "Title1": "Image Title",
                        "Title2": "",
                        "ContentType": 2,
                        "Image1": "info-sample-img02.jpg",
                        "Image2": ""
                    }
                ]
            },
            "GuestPackage": {
                "Title1": "Event2 Guest Package Title",
                "Title2": "",
                "DisplayQRcode": 1,
                "DisplayGuestName": 1,
                "QRcodeDescription1": "",
                "QRcodeDescription2": "",
                "DisplayTicketRedemption": 1,
                "TicketRedemptionTitle1": "Ticket Redemption Title (English) ",
                "TicketRedemptionTitle2": "",
                "TicketRedemptionDescription1": "\u003cp\u003eTicket Redemption Description (English)\u003c/p\u003e\n",
                "TicketRedemptionDescription2": "",
                "ShowTicketTypes": 1,
                "ShowTicketRedemptionStatus": 1,
                "ShowTicketRedemptionDate": 1,
                "DisplayHospitality": 1,
                "HospitalityTitle1": "Hospitality Title (English) ",
                "HospitalityTitle2": "",
                "HospitalityDescription1": "\u003cp\u003eHospitality Description (English)\u003c/p\u003e\n",
                "HospitalityDescription2": "",
                "ShowHospitalityType": 1,
                "ShowHospitalityDate": 1,
                "DisplayGiftRedemption": 1,
                "GiftRedemptionTitle1": "Gift Redemption Title (English)",
                "GiftRedemptionTitle2": "",
                "GiftRedemptionDescription1": "\u003cp\u003e456\u003c/p\u003e\n",
                "GiftRedemptionDescription2": "",
                "ShowGiftTypes": 1,
                "ShowGiftRedemptionStatus": 1,
                "ShowGiftRedemptionDate": 1,
                "DisplayAccomodation": 1,
                "AccomodationTitle1": "Accomodation Title (English)",
                "AccomodationTitle2": "",
                "AccomodationDescription1": "\u003cp\u003eAccomodation Description (English)\u003c/p\u003e\n",
                "AccomodationDescription2": "",
                "ShowAccomodationType": 1,
                "ShowAccomodationDate": 1,
                "DisplayEntertainment": 1,
                "EntertainmentTitle1": "Entertainment Title (English) ",
                "EntertainmentTitle2": "",
                "EntertainmentDescription1": "\u003cp\u003eEntertainment Description (English)\u003c/p\u003e\n",
                "EntertainmentDescription2": "",
                "ShowEntertainmentType": 1,
                "ShowEntertainmentDate": 1,
                "DisplayHost": 1,
                "HostTitle1": "Host Title (English)",
                "HostTitle2": "",
                "HostDescription1": "\u003cp\u003eHost Description (English)\u003c/p\u003e\n",
                "HostDescription2": "",
                "ShowHostName": 1,
                "ShowHostPhoto": 1
            },
            "PopupNotice": null
        }
    ]
};