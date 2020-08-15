window.addEventListener("DOMContentLoaded" , () => {
    
    // tabs

    let tabs = document.querySelectorAll(".tabcontent");
    let tabBtns = document.querySelectorAll(".tabheader__item");
    let tabsParent = document.querySelector(".tabheader__items");


    function hideTabs() {
        tabs.forEach(item => {
            item.classList.add("hide");
            item.classList.remove("show", "fade");
        });

        tabBtns.forEach(item => {
            item.classList.remove("tabheader__item_active");
        });
    }

    function showTabs(i = 0) {
        tabs[i].classList.add("show", "fade");
        tabs[i].classList.remove("hide", );
        tabBtns[i].classList.add("tabheader__item_active");
    }

    hideTabs();
    showTabs();

    tabsParent.addEventListener('click' , (event) => {

        let target = event.target;

        if (target && target.classList.contains('tabheader__item')) {
            tabBtns.forEach((item , i) => {
                if (target == item) {
                    hideTabs();
                    showTabs(i);
                }
            });
        }

    });


    // modal

    let modal = document.querySelector(".modal");
    let modalShowBtns = document.querySelectorAll("[data-modal]");
    let modalClose = document.querySelector("[data-close]")


    function modalShow() {
        modal.classList.add("show");
        modal.classList.remove("hide");
        document.body.style.overflow = "hidden";
        clearInterval(modalTimerId);
    }

    modalShowBtns.forEach(item => {
        item.addEventListener('click' , modalShow)
    });

    function modalHide() {
        modal.classList.remove("show");
        modal.classList.add("hide");
        document.body.style.overflow = "";
    }

    modal.addEventListener('click' , (e) => {
        if(e.target == modal || e.target.getAttribute('data-close') == "") {
            modalHide();
        }
    });

    document.addEventListener('keydown', (e) => {
        if(e.code === "Escape") {
            modalHide();
        }
    });

    let modalTimerId = setTimeout(modalShow , 60000);

    function showModalByScroll() {
        if (window.pageYOffset + document.documentElement.clientHeight >= document.documentElement.scrollHeight) {
            modalShow();
            window.removeEventListener('scroll' , showModalByScroll);
        }
    }

    window.addEventListener('scroll', showModalByScroll);

    // class for card

    class MenuCard {
        constructor(src, alt, title , desc , price, parentSelector , ...classes) {
            this.src = src;
            this.alt = alt;
            this.title = title;
            this.desc = desc;
            this.price = price;
            this.classes = classes;
            this.parent = document.querySelector(parentSelector);
            this.transfer = 25;
            this.changeToUAH();
        }

        changeToUAH() {
            this.price *= this.transfer;
        }

        render() {
            const element = document.createElement('div');
            element.classList.add('menu__item');

            this.classes.forEach(className => element.classList.add(className));
            
            element.innerHTML += `
                <img src=${this.src} alt=${this.alt}>
                <h3 class="menu__item-subtitle">${this.title}</h3>
                <div class="menu__item-descr">${this.desc}</div>
                <div class="menu__item-divider"></div>
                <div class="menu__item-price">
                    <div class="menu__item-cost">Цена:</div>
                    <div class="menu__item-total"><span>${this.price}</span> грн/день</div>
                </div>
            `;
            this.parent.append(element);
        }
    }

    const getResource = async (url) => {
        const res = await fetch(url);

        if (!res.ok) {
            throw new Error(`Could not fetch ${url}, status: ${res.status}`);
        }

        return await res.json();
    }

    getResource('http://localhost:3000/menu')    
    .then(data => {
        data.forEach(({img, altimg, title, descr, price}) => {
            new MenuCard(img, altimg, title, descr, price, '.menu .container').render();
        });
    });



    // forms

    const forms = document.querySelectorAll('form');

    const message = {
        loading: "icons/spinner.svg",
        success: "Success", 
        failure: "Error"
    };

    forms.forEach(item => {
        bindPostData(item);
    });

    const postData = async (url, data) => {
        const res = await fetch(url, {
            method: "POST",
            headers: {
                'Content-type': 'application/json'
            },
            body: data
        });

        return await res.json();
    };

    function bindPostData(form) {
        form.addEventListener('submit' , (e) => {
            e.preventDefault();

            const statusMessage = document.createElement('img');
            statusMessage.src = message.loading;
            statusMessage.style.cssText = `
                display : block;
                margin: 0 auto;
            `
            form.insertAdjacentElement('afterend' , statusMessage);

            const formData = new FormData(form);

            const object = {};
            formData.forEach(function(value, key) {
                object[key] = value;
            });

            const json = JSON.stringify(Object.fromEntries(formData.entries()));

            postData('http://localhost:3000/requests', json)
            .then(data => {
                console.log(data);
                showThanksModal(message.success);
                statusMessage.remove();
            }).catch(() => {
                showThanksModal(message.failure);
            }).finally(() => {
                form.reset();
            });

        });

    }

    function showThanksModal(message) {
        const prevModalDialog = document.querySelector('.modal__dialog');

        prevModalDialog.classList.add('hide');
        prevModalDialog.classList.remove('show');
        modalShow();

        const thanksModal = document.createElement('div');
        thanksModal.classList.add('modal__dialog');
        thanksModal.innerHTML = `
            <div class="modal__content">
                <div data-close class="modal__close">&times;</div>
                <div class="modal__title">${message}</div>
            </div>
        `;

        document.querySelector('.modal').append(thanksModal);
        setTimeout(() => {
            thanksModal.remove();
            prevModalDialog.classList.add('show');
            prevModalDialog.classList.remove('hide');
            modalHide();
        }, 2000);
    }
    
    fetch('http://localhost:3000/menu')
        .then(data => data.json())
        .then(res => console.log(res));



    // slider

    const slidesWrapper = document.querySelector('.offer__slider-wrapper');
    const slidesField = document.querySelector('.offer__slider-inner');
    const slides = document.querySelectorAll('.offer__slide');
    const slider = document.querySelector('.offer__slider');
    const btnPrev = document.querySelector('.offer__slider-prev');
    const btnNext = document.querySelector('.offer__slider-next');
    const slidesTotal = document.querySelector('#total');
    const slidesCurrent = document.querySelector('#current');
    const width = window.getComputedStyle(slidesWrapper).width;

    let slideIndex = 1;
    let offset = 0;

    
    if(slides.length < 10) {
        slidesTotal.textContent = `0${slides.length}`;
        slidesCurrent.textContent = `0${slideIndex}`
    } else {
        slidesTotal.textContent = slides.length;
        slidesCurrent.textContent = slideIndex;
    }
    // slidesCurrent.textContent = `0${slideIndex}`;

    slidesField.style.width = 100 * slides.length + "%";
    slidesField.style.display = "flex";
    slidesField.style.transition = "0.5s all";

    slidesWrapper.style.overflow = "hidden";

    slides.forEach(slide => {
        slide.style.width = width;
    });

    slider.style.position = "relative";

    const dots = document.createElement('ol');
    const dotsWrap = [];
    dots.classList.add('dots');
    slider.append(dots);

    for (let i = 0; i<slides.length; i++) {
        const dot = document.createElement('li');
        dot.setAttribute('data-slide-to', i + 1);
        dot.classList.add('dot');
        if (i == 0) {
            dot.style.opacity = 1;
        }
        dots.append(dot);
        dotsWrap.push(dot);
    }

    function checkS() {
        if(slides.length < 10) {
            slidesCurrent.textContent = `0${slideIndex}`;
        } else {
            slidesCurrent.textContent = slideIndex;
        }
    }

    if(slides.length < 10) {
        slidesTotal.innerHTML = `0${slides.length}`;
    } else {
        slidesTotal.innerHTML = `${slides.length}`;
    }
    slidesCurrent.innerHTML = `0${slideIndex}`;

    btnNext.addEventListener('click', () => {
        if (offset == +width.replace(/\D/g, '') * (slides.length -1)) {
            offset = 0;
        } else {
            offset += +width.replace(/\D/g, '')
        }
        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == slides.length) {
            slideIndex = 1;
        } else {
            slideIndex++;
        }

        checkS();

        dotsWrap.forEach(dot => dot.style.opacity = "0.5");
        dotsWrap[slideIndex -1].style.opacity = 1;
    });

    btnPrev.addEventListener('click', () => {
        if (offset == 0) {
            offset = +width.replace(/\D/g, '') * (slides.length-1);
        } else {
            offset -= +width.replace(/\D/g, '');
        }
        slidesField.style.transform = `translateX(-${offset}px)`;

        if (slideIndex == 1) {
            slideIndex = slides.length;
        } else {
            slideIndex--;
        }

        checkS();
        dotsWrap.forEach(dot => dot.style.opacity = "0.5");
        dotsWrap[slideIndex -1].style.opacity = 1;
    });

    dotsWrap.forEach(dot => {
        dot.addEventListener('click' , (e) => {
            const slideTo = e.target.getAttribute('data-slide-to');

            slideIndex = slideTo;
            offset = +width.replace(/\D/g, '') * (slideTo - 1); 

            slidesField.style.transform = `translateX(-${offset}px)`;

            dotsWrap.forEach(dot => dot.style.opacity = "0.5");
            dotsWrap[slideIndex -1].style.opacity = 1;

            checkS();
        });
    });


    // calc

    const result = document.querySelector('.calculating__result span');


    let sex, height, weight, age, ratio;

    if (localStorage.getItem('sex')) {
        sex = localStorage.getItem('sex');
    } else {
        sex = 'female';
        localStorage.setItem('sex', 'female');
    }

    if (localStorage.getItem('ratio')) {
        ratio = localStorage.getItem('ratio');
    } else {
        ratio = 1.375;
        localStorage.setItem('ratio', 1.375);
    }

    function initLocalSetting(selector,activeClass) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(elem => {
            elem.classList.remove(activeClass);
            if (elem.getAttribute('id') === localStorage.getItem('sex')) {
                elem.classList.add(activeClass);
            }
            if (elem.getAttribute('data-ratio') === localStorage.getItem('ratio')) {
                elem.classList.add(activeClass);
            }
        });
    }

    initLocalSetting('#gender div', 'calculating__choose-item_active');
    initLocalSetting('.calculating__choose_big div', 'calculating__choose-item_active');

    function calcTotal() {
        if (!sex || !height || !weight || !age || !ratio) {
            result.textContent = "____";
            return;
        } 
        if (sex === "female") {
            result.textContent = Math.round((447.6 + (9.2 * weight) + (3.1 * height) - (4.3 * age)) * ratio);
        } else {
            result.textContent = Math.round((88.36 + (13.4 * weight) + (4.8 * height) - (5.7 * age)) * ratio);
        }
    }

    calcTotal();

    function getStaticInfo(selector, activeClass) {
        const elements = document.querySelectorAll(selector);

        elements.forEach(elem => {
            elem.addEventListener('click', (e) => {
                if(e.target.getAttribute('data-ratio')) {
                    ratio = +e.target.getAttribute('data-ratio');
                    localStorage.setItem('ratio', +e.target.getAttribute('data-ratio'));
                } else {
                    sex = e.target.getAttribute('id');
                    localStorage.setItem('sex', e.target.getAttribute('id'));
                }
    
                elements.forEach(elem => {
                    elem.classList.remove(activeClass);
                });
    
                e.target.classList.add(activeClass);

                calcTotal();
            })
        });
    }

    getStaticInfo('#gender div', 'calculating__choose-item_active');
    getStaticInfo('.calculating__choose_big div', 'calculating__choose-item_active');

    function getDynamicInformation (selector) {
        const input = document.querySelector(selector);

        input.addEventListener('input', () => {

            if(input.value.match(/\D/g)) {
                input.style.border = '1px solid red';
            } else {
                input.style.border = 'none';
            }

            switch (input.getAttribute('id')) {
                case 'height':
                    height = +input.value;
                    break;
                case 'weight':
                    weight = +input.value;
                    break;
                case 'age':
                    age = +input.value;
                    break;
            }
            calcTotal();
        });

    }

    getDynamicInformation('#height');
    getDynamicInformation('#weight');
    getDynamicInformation('#age');


});