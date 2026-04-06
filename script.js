var selectedChar = null;
qbMultiCharacters = {};
var Loaded = false;
var NChar = null;
var EnableDeleteButton = false;
var background  = document.getElementById("musica_fondo");
var click       = document.getElementById("click");
var over_button = document.getElementById("click");
var confirmar   = document.getElementById("click");

$(document).ready(function() {
    window.addEventListener('message', function(event) {
        var data = event.data;

        if (data.action == "ui") {
            NChar = data.nChar;
            EnableDeleteButton = data.enableDeleteButton;

            if (data.toggle) {
                $('.container').show();
                $('.jugadores-on').hide();
                $('.fondocolor').hide();
                $('.bottombar').hide();
                $('.topbar').show();
                $('#bg-canvas, .bg-overlay').show();

                // Dviejų juostų kritimas iš viršaus į apačią
                $('.topbar').stop(true, true).css("top", "-100%");
                $('.bottombar').stop(true, true).css("top", "-200%");

                $(".welcomescreen").fadeIn(150);
                qbMultiCharacters.resetAll();

                var originalText = "Kraunami veikėjai";
                var loadingProgress = 0;
                var loadingDots = 0;
                $("#loading-text").html(originalText);
                $('.fondocolor').show();

                var DotsInterval = setInterval(function() {
                    loadingDots++;
                    loadingProgress++;

                    if (loadingProgress == 3) {
                        originalText = "Tikrinami duomenys";
                        $("#loading-text").html(originalText);
                    }
                    if (loadingProgress == 4) {
                        originalText = "Gaunami veikėjai";
                        $("#loading-text").html(originalText);
                    }
                    if (loadingProgress == 6) {
                        originalText = "Tikrinami veikėjai";
                        $("#loading-text").html(originalText);
                    }
                    if (loadingDots == 4) {
                        loadingDots = 0;
                    }
                }, 3000);

                setTimeout(function() {
                    setCharactersList();
                    $.post('https://qb-multicharacter/setupCharacters');

                    setTimeout(function() {
                        clearInterval(DotsInterval);
                        loadingProgress = 0;

                        $(".welcomescreen").fadeOut(900);
                        $('.fondocolor').fadeOut(450);

                        setTimeout(function() {
                            $(".title-screen").fadeIn(300);

                            // Viena juosta leidžiasi iš viršaus į apačią
                            qbMultiCharacters.fadeInDown('.topbar', '100%', 1050);

                            setTimeout(function() {
                                $(".fondo-negro").fadeOut(450);
                            }, 300);
                        }, 450);

                        $(".btn-iniciar").mouseenter(function() {
                            if (over_button && over_button.play) over_button.play();
                        });
                        $(".btn-iniciar").click(function() {
                            if (confirmar && confirmar.play) confirmar.play();
                        });
                    }, 2000);
                }, 2000);

                if (background && background.play) {
                    background.volume = 0.3;
                    background.currentTime = 0;
                    background.play().catch(function(){});
                }
            } else {
                $('.container').fadeOut(250);
                qbMultiCharacters.resetAll();
            }
        }

        if (data.action == "setupCharacters") setupCharacters(event.data.characters);
        if (data.action == "setupCharInfo") setupCharInfo(event.data.chardata);
        if (data.action == "stopMusic") musicFadeOut();
    });
});

// ── Enter server button ──────────────────────────
$(".btn-iniciar").on("click", function() {
    $(".title-screen").fadeOut(300, function() {
        $('.characters-list').fadeIn(380).addClass('visible');
        $('.character-info').fadeIn(380).addClass('visible');
        $('.jugadores-on').fadeIn();

        // Remove intro-only layers so gameplay character UI is clean
        $('.fondocolor, .topbar, .bg-overlay').fadeOut(260);

        $.post('https://qb-multicharacter/removeBlur');
    });
});

// ── Populate character info panel ───────────────
function setupCharInfo(cData) {
    if (cData == 'empty') {
        $('.character-info-valid').html('<span id="no-char">Ši vieta tuščia.<br>Pasirink ją, kad sukurtum naują veikėją.</span>');
    } else {
        var gender = cData.charinfo.gender == 1 ? "Moteris" : "Vyras";
        $('.character-info-valid').html(
            row("Vardas", cData.charinfo.firstname + ' ' + cData.charinfo.lastname) +
            row("Gimė", cData.charinfo.birthdate) +
            row("Lytis", gender) +
            row("Tautybė", cData.charinfo.nationality) +
            row("Darbas", cData.job.label) +
            row("Gryni", '$' + cData.money.cash) +
            row("Bankas", '$' + cData.money.bank) +
            row("Telefonas", cData.charinfo.phone) +
            row("Sąskaita", cData.charinfo.account)
        );
    }
}

function row(label, value) {
    return '<div class="character-info-box">' +
        '<span id="info-label">' + label + '</span>' +
        '<span class="char-info-js">' + value + '</span>' +
        '</div>';
}

// ── Populate character slots ─────────────────────
function setupCharacters(characters) {
    $.each(characters, function(index, char) {
        $('#char-' + char.cid).html("");
        $('#char-' + char.cid).data("citizenid", char.citizenid);

        setTimeout(function() {
            $('#char-' + char.cid).html(
                '<span id="slot-name"><i class="fa fa-user" style="color:#4da6ff;margin-right:8px;"></i>' +
                char.charinfo.firstname + ' ' + char.charinfo.lastname +
                '<span id="cid">' + char.citizenid + '</span></span>'
            );
            $('#char-' + char.cid).data('cData', char);
            $('#char-' + char.cid).data('cid', char.cid);
        }, 100);
    });
}

// ── Character slot click ─────────────────────────
$(document).on('click', '.character', function(e) {
    var cDataPed = $(this).data('cData');
    e.preventDefault();

    if (selectedChar !== null) $(selectedChar).removeClass("char-selected");
    selectedChar = $(this);
    $(selectedChar).addClass("char-selected");

    if ((selectedChar).data('cid') == "") {
        setupCharInfo('empty');
        $("#play-text").html('<i class="fa fa-plus"></i> Registruoti');
        $("#play").css("display", "block");
        $("#delete").css("display", "none");
    } else {
        setupCharInfo($(this).data('cData'));
        $("#play-text").html('<i class="fa fa-sign-in"></i> Žaisti');
        $("#delete-text").html('<i class="fa fa-trash"></i> Ištrinti');
        $("#play").css("display", "block");
        if (EnableDeleteButton) $("#delete").css("display", "block");
    }

    $.post('https://qb-multicharacter/cDataPed', JSON.stringify({ cData: cDataPed }));
});

// ── Play button ──────────────────────────────────
$(document).on('click', '#play', function(e) {
    e.preventDefault();
    if (selectedChar === null) return;

    var charData = $(selectedChar).data('cid');

    if (charData !== "") {
        $.post('https://qb-multicharacter/selectCharacter', JSON.stringify({
            cData: $(selectedChar).data('cData')
        }));

        setTimeout(function() {
            $('.characters-list').fadeOut(400);
            $('.character-info').fadeOut(400);
            qbMultiCharacters.resetAll();
        }, 1500);
    } else {
        $('.characters-list').css("filter", "blur(2px)");
        $('.character-info').css("filter", "blur(2px)");
        $('.character-register').fadeIn(300);
    }
});

// ── Delete button ────────────────────────────────
$(document).on('click', '#delete', function(e) {
    e.preventDefault();
    if (selectedChar === null) return;
    if ($(selectedChar).data('cid') !== "") {
        $('.character-delete').fadeIn(200);
    }
});

// ── Confirm delete ───────────────────────────────
$(document).on('click', '#accept-delete', function() {
    $.post('https://qb-multicharacter/removeCharacter', JSON.stringify({
        citizenid: $(selectedChar).data("citizenid"),
    }));

    $('.character-delete').fadeOut(150);
    refreshCharacters();
});

$(document).on('click', '#cancel-delete', function(e) {
    e.preventDefault();
    $('.character-delete').fadeOut(150);
});

// ── Close register form ──────────────────────────
$(document).on('click', '#close-reg', function(e) {
    e.preventDefault();
    $('.characters-list').css("filter", "none");
    $('.character-info').css("filter", "none");
    $('.character-register').fadeOut(250);
});

// ── Confirm create ───────────────────────────────
var entityMap = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;' };

function escapeHtml(string) {
    return String(string).replace(/[&<>"'=\/`]/g, function(s){ return entityMap[s]; });
}

function hasWhiteSpace(s) {
    return /\s/g.test(s);
}

$('#nationality').keyup(function() {
    var v = $(this).val();
    if (v.indexOf(' ') !== -1) $(this).val(v.replace(' ',''));
});

$(document).on('click', '#create', function(e) {
    e.preventDefault();

    var firstname = escapeHtml($('#first_name').val());
    var lastname = escapeHtml($('#last_name').val());
    var nationality = escapeHtml($('#nationality').val());
    var birthdate = escapeHtml($('#birthdate').val());
    var gender = escapeHtml($('select[name=gender]').val());
    var cid = escapeHtml($(selectedChar).attr('id').replace('char-',''));
    const regTest = new RegExp(profList.join('|'), 'i');

    if (!firstname || !lastname || !nationality || !birthdate ||
        hasWhiteSpace(firstname) || hasWhiteSpace(lastname) || hasWhiteSpace(nationality)) return false;
    if (regTest.test(firstname) || regTest.test(lastname)) return false;

    $.post('https://qb-multicharacter/createNewCharacter', JSON.stringify({
        firstname: firstname,
        lastname: lastname,
        nationality: nationality,
        birthdate: birthdate,
        gender: gender,
        cid: cid,
    }));

    $('.container').fadeOut(150);
    $('.characters-list').css("filter", "none");
    $('.character-info').css("filter", "none");
    $('.character-register').fadeOut(250);
    refreshCharacters();
});

// ── Helpers ──────────────────────────────────────
function setCharactersList() {
    var html = '<div class="character-list-header"><p>Mano veikėjai</p></div>';
    for (var i = 1; i <= NChar; i++) {
        html += '<div class="character" id="char-' + i + '" data-cid="">' +
            '<span id="slot-name">Tuščia vieta <span id="cid"></span></span></div>';
    }
    html += '<div class="character-btn" id="play"><p id="play-text">Pasirink veikėją</p></div>' +
        '<div class="character-btn" id="delete"><p id="delete-text">Pasirink veikėją</p></div>';
    $('.characters-list').html(html);
}

function refreshCharacters() {
    var html = '';
    for (var i = 1; i <= NChar; i++) {
        html += '<div class="character" id="char-' + i + '" data-cid="">' +
            '<span id="slot-name">Tuščia vieta <span id="cid"></span></span></div>';
    }
    html += '<div class="character-btn" id="play"><p id="play-text">Pasirink veikėją</p></div>' +
        '<div class="character-btn" id="delete"><p id="delete-text">Pasirink veikėją</p></div>';
    $('.characters-list').html(html);

    setTimeout(function() {
        if (selectedChar) $(selectedChar).removeClass("char-selected");
        selectedChar = null;
        $.post('https://qb-multicharacter/setupCharacters');
        $("#delete").css("display", "none");
        $("#play").css("display", "none");
        qbMultiCharacters.resetAll();
    }, 100);
}

qbMultiCharacters.fadeInDown = function(element, percent, time) {
    $(element).stop(true, true).animate({ top: percent }, {
        duration: time,
        easing: 'swing'
    });
};

qbMultiCharacters.fadeInDown2 = function(element, percent, time) {
    $(element).animate({ 'margin-top': percent }, time);
};

qbMultiCharacters.fadeOutDown = function(element, percent, time) {
    var target = percent || "103.5%";
    $(element).animate({ top: target }, time, function() {
        $(element).css("display", "none");
    });
};

qbMultiCharacters.resetAll = function() {
    $('.characters-list').hide().css("filter", "none");
    $('.character-info').hide().css("filter", "none");
    $('.character-register').hide();
    $('.character-delete').hide();
    $('.topbar').show();
    $('.bottombar').hide();
    $('.bg-overlay').show();
    $(".welcomescreen").fadeIn(300);
    $(".fondo-negro").fadeIn(0);
    selectedChar = null;
};

function musicFadeOut() {
    if (background) $(background).animate({ volume: 0 }, 3000);
}

$('.disconnect-btn').click(function(e) {
    e.preventDefault();
    $.post('https://qb-multicharacter/closeUI');
    $.post('https://qb-multicharacter/disconnectButton');
});
