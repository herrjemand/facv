# TODO

## Frontend

- Layout | I.P. (Niemand)
    + ~~categories tabs~~
    + ~~new item form(anonymous)~~
    + ~~alerts~~

- App    | I.P. (Niemand)
    + ~~app layout~~
    + ~~JSON API~~
    + ~~models~~
    + New advert submit
        * ~~Form~~
        * ~~Fields~~
        * ~~Client-side validation~~
        * ~~Image upload~~
        * ~~POST sender~~
        * ~~Alerts~~
        * Captcha
    
    + ~~Frontend search~~

- ~~Localization | I.P. (Niemand)~~
    + ~~Language detection~~
    + ~~Language set~~
    + ~~Translation arrays (JSON)~~

## Backend

 - JSON REST | I.P. (Niemand)
    - adverts.php | I.P. (Niemand)
        + ~~MySQL~~
        + ~~Categories~~
        + ~~Response Codes~~
        + ~~Timestamp sort~~
        + ~~Caching~~ CANCELED
            * ~~Pre-generate caching~~
            * ~~Cache revision number - not re-request same content.~~
    
    - post        | I.P. (Niemand)
        + ~~POST Handler~~
        + ~~SQL `add` class~~
        + ~~Server side validation~~

 - Image
    - uploading | I.P. (Fulton)
        - ~~IMG to base64 -> JSON~~
        - ~~base64 to IMG~~
        - ~~size check (lim 250kb)~~
        - ~~name md5 filename + timestamp~~

 - ~~I.P. Bind~~
     + ~~Create table for ip addresses~~m     + ~~Create IP class~~
     + ~~Add restriction~~

 - Authentication
     + Login | Challenge-Response
         * Client
             - ~~HASH(Salt, Password) POST~~
         * Server 
             - ~~Login form~~
             - ~~Password table~~
             - ~~SQL~~
             - ~~HASH~~
     + ~~Registration~~ | Canceled

 - ~~Error Codes~~

 - Central config

## Admin
 - SQL
     + Bureau
         * ~~Get~~
         * ~~Add~~
         * ~~Update~~
         * ~~Delete~~

     + Users
         * ~~Get~~
         * ~~Add~~
         * ~~Update~~
         * ~~Delete~~

 - Frontend
     + Bureau
         * ~~Delete~~
         * ~~Get and Update~~
         * ~~Add~~

     + Users
         * ~~Delete~~
         * ~~Get and Update~~
         * ~~Add~~

## General
 - ~~RENAME TO kreved.co~~
 - ~~RENAME TO facv~~

 - **.htaccess**
    - ~~Request rewrite~~
    - ~~Restrict folder view(no listing)~~

## Bugs
 - ~~Notifications~~
 - ~~Show error when editing admin~~
 - ~~Reindex database(deleting expired adverts) - later~~
 - ~~Searching adverts in admin~~
 - ~~Недоделаная кнопка редактрирования пользователей Форма открывается, но не работает. Регистрация тоже не работает. Не правильно генерирует пароль предполагаю~~

## Extra bonus
 - ~~Domain~~
