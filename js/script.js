$(function () {

    var gender, gd, nama;
    var mon, day, month, year, yeara;
    var uang = 0, gaji = new Array(8), gmin = [12000000, 15000000, 12000000, 12000000, 7000000, 4000000, 12000000,//6
        8000000, 4000000, 24000000, 42000000, 27000000, 45000000,//12
        24000000, 42000000, 12000000, 24000000, 12000000, 24000000], gajia, gajib = 0;
    var kra, kraa = new Array(3), krab = new Array(3), krac = new Array(3), krb, pjt = 0, pjk = false, rkr = false;
    var umur = 0, o = 0, status_i = "baby", status = "Infant", sd, smp, gyma, per, medt, sman, sma, smka = 0;
    //var smka u/ brp tahun lama blajar di  sma berlangsung
    var learn = 0, um, un = 0, major = ["Arts", "Biology", "Chemistry", "Computer Science", "Finance"];
    // learn u/ derajat pekerjaan
    // variebal o u/ okupansi
    // o=0 Infant
    // 1 SD
    // 2 SMP
    // 3 SMA
    // 4 Tidak bekerja
    // 5 Bekerja
    // 6 Penjara
    // 7 Universitas
    // var o=0, sd, smp, sma, sman=0, learn=0, um, un=0, major=["Arts","Biology","Chemistry","Computer Science","Finance"];
    var peny = ["Batuk rejan", "Campak", "DBD", "Kanker",//3
        "Coronavirus", "Alzheimer", "Epilepsi", "Flu",//7
        "Diare", "Diabetes", "Tubercolosis", "Penyakit jantung"], isp = new Array(peny.length), penh = new Array(peny.length);
    var u, ua = 0, uc = ["Biologi", "Inggris", "Keuangan", "Kimia", "Matematika", "Psikologi", "Sains Komputer", "Sains Politik", "Sejarah", "Sistem Informasi"], ud, ue, ul;
    // var ue == 0 beasiswa / 1 ngga beasiswa
    var bekerja = false, kerjab, kerjac = false, kerjad = ["Jr. App Developer", "Jr. Banker", "Jr. Computer Programmer", "Pemadam Kebakaran", "Petani", "Petugas Kebersihan", "Polisi",//6
        "Satpam", "Tukang Sampah", "App Developer", "Sr. App Developer", "Banker", "Sr. Banker", "Computer Programmer", "Sr. Computer Programmer",//14
        "Kameramen Magang", "Kameramen", "Fotografer Magang", "Fotografer"];//18
    var kerjar = new Array(8), kerjam, kerjan = false, kerjat = 0, pk = new Array(5), karird = [9, 11, 13, 3, 4, 5, 6,//6
        7, 8, 9, 9, 11, 11, 13, 13,//14
        16, 16, 18, 18];
    var sosjoin = false, follower = 0, followa, sosmeda = 0, sosa, sosp = false, spost = 0;
    var sim = false, simb = false, simu, r, i, kec = new Array(6), died = false, dieCauses = [" meninggal karena sebab alamiah", " meninggal karena usia tua",//1
        " meninggal dunia saat tidur dengan tenang", " meninggal karena pembunuhan", " meninggal setelah tersambar petir", " meninggal setelah overdosis obat"]; //5
    var mobilp = [], mj = 0, mobila = [], mobilt = false, mobilh = [], mobilhh = new Array(8), mobilu = [], mobiluu = new Array(8), mobilk, mobilkk = new Array(8), mobilm, mobilmm = false, mobild, mobill = 0;
    var rumahp = false, rj = 0, rumaha, rumaht = false, rumahh, rumahhh = new Array(8), rumahu, rumahuu = new Array(8), rumahk, rumahkk = new Array(8), rbr = new Array(8), br, rba = new Array(8), ba, rumahm, rumahmm = false, rumahd, rumahl = 0, renov, renovh = new Array(5);
    var fnamal = ["Aadiktri", "Aavya", "Amara", "Anik", "Anil", "Arpit", "Ayaan", "Banil", "Buyisiwe", "Cleveland", "Dinesh", "Donya", "Dhule", "Dube", "Dungi", "Dunyi", "Gordon", "Kabir", "Kabul", "Kadir", "Leuwinanggung", "Lucuss", "Maxim", "Megah", "Om", "Omnia", "Opiyo", "Panutan", "Pramana", "Rajiv", "Rohit", "Roman", "Sama", "Samar", "Sebastian", "Tej", "Zhiqiang"], fnamap = ["Aasmi", "Celine", "Eka", "Ekenedilichukwu", "Maria", "Navya", "Omnia", "Selena", "Serena", "Suyin", "Tasty", "Zhiqiuno"], lnama = ["Achaval", "Apolles", "Bhate", "Bhatta", "Bhave", "Chakarbarti", "Charlier", "Dikshit", "Ethulo", "Gayakvade", "Gerung", "Gerungan", "Goossens", "Gordon", "Gulati", "Ho", "Hu", "Ijendu", "Jamus", "Kamal", "Ketanggungan", "Khan", "Khatri", "Kohli", "Krueger", "Kumar", "Modi", "Misra", "Nasution", "Nunes", "Pagar", "Perry", "Pertanggungan", "Sakuda", "Salib", "Sellers", "Spinx", "Shah", "Stepanovna", "Tambunan", "Thakore", "Thakre", "Verheyen", "Wang", "Wong"];
    var hub = [true, true], hubn = [getMaleFN() + " " + getLN(), getFemaleFN() + " " + getLN()];
    var huba = ["bapak", "ibu"], hubak = ["Bapak", "Ibu"];
    var hubu = [rand(18, 33), rand(18, 33)], hubr = [rand(80, 21), rand(80, 21)], hina = ["anjing", "asw", "bangsat", "babi", "bau", "bodoh", "goblok", "jelek", "k*ntl", "tai"];
    var hubma = [false, false]; // u/ memberi uang/tahun dngn pengaruh positif
    var hubme; // u/ var prompt memberi uang
    var hubim = [false, false]; // u/ memuji tiap tahun
    var hubiw = [false, false]; // u/ menghabis waktu tiap tahun
    var hubk = [kerjad[karird[rand(0, kerjad.length)]], kerjad[karird[rand(0, kerjad.length)]]], hubm = [rand(0, 101), rand(0, 101)];
    var hubmi = [false, false]; // u/ meminta uang tiap batas  tahun
    var humb; // u/ var nominal rand diatas

    // var fnamal=["Amara","Anik","Anil","Arpit","Ayaan","Banil","Buyisiwe","Cleveland","Dinesh","Donya","Dhule","Dikram","Dunyi","Gordon","Hong","Kabir","Kabul","Kadir","Leuwinanggung","Lucuss","Maxim","Megah","Om","Omnia","Opiyo","Panutan","Pramana","Qasem","Rajiv","Rohit","Roman","Sama","Samar","Sebastian","Tej","Vikram","Zhiqiang"], fnamap=["Aasmi","Aadiktri","Celine","Dungi","Eka","Ekenedilichukwu","Maria","Navya","Omnia","Selena","Serena","Suyin","Tasty","Zhiqiuno"], fname, lname=["Achaval","Apolles","Bhate","Bhatta","Bhave","Chakarbarti","Charlier","Dikshit","Ethulo","Gayakvade","Gerung","Gerungan","Goossens","Gordon","Gulati","Ho","Hu","Ijendu","Jamus","Kamal","Ketanggungan","Khan","Khatri","Kohli","Krueger","Kumar","Modi","Misra","Nasution","Nunes","Pagar","Perry","Pertanggungan","Sakuda","Salib","Sellers","Soleimani","Spinx","Shah","Stepanovna","Tambunan","Thakore","Thakre","Verheyen","Wang","Wong"];

    function getMaleFN() {
        let a = fnamal[rand(0, fnamal.length)];
        return a;
    }

    function getFemaleFN() {
        let a = fnamap[rand(0, fnamap.length)];
        return a;
    }

    function getLN() {
        let a = lnama[rand(0, lnama.length)];
        return a;
    }

    var happy = rand(50, 51), health = rand(80, 21), smarts = rand(0, 101), looks = rand(0, 101);

    // var names = getLN();
    var ageForMessage;
    // var gender = ["male","female"];
    // var gende = rand(0,gender.length);
    // var gende = rand(0, 2);
    // var genders = gender[gende];
    // if (gende == 0) {
    //     fname = getMaleFN();
    // } else {
    //     fname = getFemaleFN();
    // }
    var otherEvents = false;
    // var rl=[true,true], rlname=[getFemaleFN()+" "+names,getMaleFN()+" "+names], rlage=[rand(18,33),rand(18,33)];
    // var o=0, sd, smp, sma, sman=0, learn=0, um, un=0, major=["Arts","Biology","Chemistry","Computer Science","Finance"];
    var drugt = false, drugs = ["Heroin", "Ganja", "Opium", "LSD", "MDMA", "Morfina", "Kokaina"];
    var hewan = ["anjing", "babi hutan", "badak", "buaya", "domba", "gajah", //5
        "gorila", "harimau", "kalajengking", "kambing", "kodok batu", //10
        "kucing", "kuda nil", "nyamuk", "tawon", "tokek", "unta", "ular"]; //17


    // $(window).load(function(){
    for (i = 0; i < peny.length; i++) {
        isp[i] = false;
        penh[i] = 0;
    }
    update();
    updateFormTgl(31);

    $("#menu-lahir").hide();
    $("#game").hide();

    // $("#happy").val(happy);
    // $("#health").val(health);
    // $("#smarts").val(smarts);
    // $("#looks").val(looks);
    // });

    $("#menu-1").click(function () {
        $("#main-menu").hide();
        $("#menu-lahir").show();
    });

    $("#menu-2").click(function () {
        swal.fire({
            icon: 'info',
            title: 'Info Pengembang',
            html: 'By Ari Eka Putragani<br><br>' +
                'Dosen Pembimbing:<br>' +
                'Dani Arifudin, M.Kom.<br>' +
                'Banu Dwi Putranto, M.Kom.'
        });
    });

    $('#jk').select2({
        width: "100%",
        placeholder: "Pilih Jenis Kelamin"
    });

    $('#kota').select2({
        width: "100%",
        placeholder: "Pilih Kota"
    });

    $('#day').select2({
        width: "22%",
        placeholder: "Tgl"
    });

    $('#month').select2({
        width: "45%",
        placeholder: "Bulan"
    });

    $('#year').select2({
        width: "30%",
        placeholder: "Tahun"
    });

    function rand(awal, ruang) {
        let num = Math.floor(Math.random() * ruang) + awal;
        return num;
    }

    function updateFormTgl(jml) {
        $("#day").empty();
        $("#day").append('<option value=""></option>');

        for (let i = 1; i <= jml; i++) {
            $("#day").append('<option value="' + i + '">' + i + '</option>');
        }
    }

    function getMaxDay(m, y) {
        if (m == 2) {
            if (y % 4 == 0) {
                return 29;
            }
            return 28;
        }

        if (m == 4 || m == 6 || m == 9 || m == 11) {
            return 30;
        }

        return 31;
    }

    function updateDayOptions(maxDay) {
        const selectedDay = parseInt($("#day").val(), 10);
        const nextDay = !isNaN(selectedDay) ? Math.min(selectedDay, maxDay) : "";

        updateFormTgl(maxDay);

        $("#day").val(nextDay === "" ? "" : String(nextDay));

        $("#day").trigger("change.select2");
    }

    function validMonth(m, y) {
        const monthMap = {
            "Januari": 1,
            "Februari": 2,
            "Maret": 3,
            "April": 4,
            "Mei": 5,
            "Juni": 6,
            "Juli": 7,
            "Agustus": 8,
            "September": 9,
            "Oktober": 10,
            "November": 11,
            "Desember": 12
        };

        const mon = monthMap[m];
        if (mon) {
            updateDayOptions(getMaxDay(mon, y));
        }
        return mon;
    }

    $("#month, #year").change(function () {
        year = $("#year").val();
        mon = validMonth($("#month").val(), year);
    });

    $("#lahirkan").click(function () {
        nama = $("#nama").val();
        gender = $("#jk").val();
        if (gender == "l")
            gd = "laki-laki";
        else
            gd = "perempuan";
        kota = $("#kota").val();
        day = $("#day").val();
        month = $("#month").val();
        // year=parseInt($("#year").val(),10);
        year = $("#year").val();
        yeara = year;
        ageForMessage = "<span class='blue'> Umur: " + umur + " tahun (" + yeara + ")</span><br>";

        if (nama != "" && gender != "" && kota != "" && day >= 1 && month != "" && year >= 1) {
            update();
            $("#menu-lahir").hide();
            $("html, body").css("background", "#e0e0e0");
            $("#game").show();
            $("#hubn0").html(hubn[0] + " (Bapak)");
            $("#hubn1").html(hubn[1] + " (Ibu)");

            newLine("<br>" + ageForMessage + "Perkenalkan nama saya " + nama + ". Saya terlahir sebagai " + gd + ". Saya lahir di " + kota + ", Indonesia pada tanggal " + day + " " + month + " " + year + ".");

            newLine("<br>Bapak saya " + hubn[0] + ", seorang " + hubk[0] + " (umur " + hubu[0] + ")");
            newLine("Ibu saya " + hubn[1] + ", seorang " + hubk[1] + " (umur " + hubu[1] + ")");
        } else {
            swal.fire("Ups...", "Masukkan data yang benar!", "error");
        }
    });

    function newLine(a) {
        $("#messages").append(a + "<br>");
        update();
    }

    function uanga(a) {
        if (uang >= a) {
            uang -= a;
            update();
        } else {
            swal.fire("Ups...", "Uang kamu tidak mencukupi!", "error");
        }
    }

    function update() {
        for (i = 0; i < peny.length; i++) {
            if (penh[i] < 0 && died == false) {
                otherEvents = true;
                penh[i] = 0;
                isp[i] = false;
                updatea(10, 3, 0, 0);
                swal.fire("Penyakit", "Kamu sembuh dari " + peny[i] + ".", "success");
                newLine("Saya sembuh dari " + peny[i] + ".");
            }
        }
        for (i = 0; i < hub.length; i++) {
            if (hubr[i] < 0) {
                hubr[i] = 0;
            } else if (hubr[i] > 100) {
                hubr[i] = 100;
            }
        }
        $("#uangm").html("Uang: Rp" + Math.floor(uang));
        $("#uangr").html("Uang: Rp" + Math.floor(uang));

        // $("#status").html("Status: " + status);

        $("#happy").val(happy);

        if (happy <= 15) {
            $("#happy-i").attr("class", "fa fa-face-frown");
        } else if (happy <= 80) {
            $("#happy-i").attr("class", "fa fa-face-meh");
        } else {
            $("#happy-i").attr("class", "fa fa-face-smile");
        }

        $("#health").val(health);

        if (health <= 15) {
            $("#health-i").attr("class", "fa fa-heart-crack");
        } else {
            $("#health-i").attr("class", "fa fa-heart");
        }

        $("#smarts").val(smarts);

        if (smarts <= 15) {
            $("#smarts-i").attr("class", "fa fa-face-grin-tongue");
        } else if (smarts <= 80) {
            $("#smarts-i").attr("class", "fa fa-brain");
        } else {
            $("#smarts-i").attr("class", "fa fa-lightbulb");
        }

        $("#looks").val(looks);

        if (looks <= 15) {
            $("#looks-i").attr("class", "fa fa-skull");
        } else if (looks <= 80) {
            $("#looks-i").attr("class", "fa fa-user");
        } else {
            $("#looks-i").attr("class", "fa fa-user-tie");
        }

        // if(status=="SD"||status=="SMP"||status=="SMA"||status=="Universitas") {
        // if(status=="Sekolah") {
        if (o == 1 || o == 2 || o == 3 || o == 7) {
            status_i = "school";
            status = "Sekolah";
            // $("#kerja").html("Berhenti sekolah");
            // $("#kerja").attr("class","tmbl-aktif");
            // $("#univ").attr("class","");
            // } else if(status=="Tidak bekerja"||status=="Pensiun") {
            // } else if(status=="Pekerjaan") {
        } else if (o == 4 || o == 5 || o == 8) {
            // bekerja=false;
            status_i = "briefcase";
            status == "Pekerjaan";
            // $("#kerja").html("Kerja");
            // if(umur>=18&&ua<4) { 
            //     $("#univ").attr("class","tmbl-aktif");
            // }
            // } else if(status=="Di penjara") {
        } else if (o == 6) {
            status_i = "xmarks_lines";
            status == "Di penjara";
            // bekerja=true;
            // $("#kerja").html("Berhenti bekerja");
            // $("#univ").attr("class","");
        }
        $("#tombol-1").html('<i class="fa fa-' + status_i + '"></i> ' + status);

        // switch(status) {
        //         case "SD":
        //         $("#statusa").html("Kamu bersekolah di SD.");
        //         break;
        //         case "SMP":
        //         $("#statusa").html("Kamu bersekolah di SMPN "+smp+" "+kota+".");
        //         break;
        //         case "SMA":
        // $("#statusa").html("Kamu bersekolah di "+sman+" "+sma+" "+kota+".");
        //         break;
        // case "Universitas":
        // $("#statusa").html("Kamu kuliah di Universitas. Jurusan: "+uc[u]);
        // break;
        // case "Bekerja":
        // $("#statusa").html("Kamu bekerja sebagai "+kerjad[kerjab]+". Gaji per bulan kamu sekarang Rp"+Math.floor(gajib)+".");
        // break;
        // case "Di penjara":
        // $("#statusa").html("Kamu di penjara. Kamu akan bebas dalam "+pjt+" tahun lagi.");
        // break;
        // case "Tidak bekerja":
        // case "Pensiun":
        // $("#statusa").html("");
        // }
        // }
        $("#topPart").html("AmpuLife | Rp" + uang);
        document.getElementById("messages").scrollBy(0, 1000000);
    }

    function updatea(a, b, c, d) {
        happy += a;
        health += b;
        smarts += c;
        looks += d;
        if (happy > 100) {
            happy = 100;
        } else if (happy < 0) {
            happy = 0;
        }
        if (health > 100) {
            health = 100;
        } else if (health <= 0) {
            health = 0;
            die();
        }
        if (smarts > 100) {
            smarts = 100;
        } else if (smarts < 0) {
            smarts = 0;
        }
        if (looks > 100) {
            looks = 100;
        } else if (looks < 0) {
            looks = 0;
        }
        update();
    }

    function randomEvents() {
        r = Math.random();
        // if (kota == "Medan") {
        //     if (r < 0.001) {
        //         die(3);
        //     }
        // }
        // if (died == false) {
        if (r < 0.001) {
            if (kota == "Medan") {
                die(3);
            }
        } else if (r < 0.03) {
            penyakit(7);
        } else if (r < 0.05) {
            penyakit(8);
        } else if (r < 0.3) {
            if (o == 1 || o == 2 || o == 3 | o == 7) {
                r = Math.random();
                let blfn, blln;
                if (r < 0.5) {
                    blfn = getMaleFN();
                } else {
                    blfn = getFemaleFN();
                }
                blln = getLN();
                swal.fire({
                    title: "Sekolah",
                    text: "Kamu dibuli oleh " + blfn + " " + blln,
                    icon: "warning",
                    showCancelButton: true,
                    showDenyButton: true,
                    cancelButtonText: "Tidak melakukan apa-apa",
                    denyButtonText: "Antem",
                    confirmButtonText: "Laporkan ke kepala sekolah"
                }).then((result) => {
                    newLine("Saya dibuli oleh " + blfn + ".");
                    if (result.isConfirmed) {
                        newLine("Saya melaporkan " + blfn + " ke kepala sekolah.");
                    } else if (result.isDenied) {
                        newLine("Saya mengantemi " + blfn + "!");
                    } else {
                        newLine("Saya tidak melakukan apa-apa.");
                    }
                });
            }
        } else if (r < 0.35 && umur < 6) {
            r = Math.random();
            if (r < 0.2) {
                penyakit(0);
            } else if (r < 0.4) {
                penyakit(1);
            } else if (r < 0.6) {
                penyakit(2);
            } else if (r < 0.8) {
                penyakit(3);
            } else {
                penyakit(6);
            }
        }

        if (r >= 0.35 && umur >= 18) {
            if (r < 0.3501) {
                // r = Math.random();
                // if (r < 0.0001) {
                if (o != 6) {
                    r = Math.random();
                    swal.fire("Korban", "Kamu tersambar gledek!", "warning");
                    newLine("Aku tersambar gledek!");
                    if (r < 0.5) {
                        updatea(-100, -100, -100, -100);
                    } else {
                        updatea(100, 100, 100, 100);
                    }
                }
                // } else if (r < 0.05) {
                //     r = Math.random();
                //     if (r < 0.16) {
                //         if (confirm("Kamu ditawar Heroin")) {
                //             updatea(0, -50, 0, 0);
                //             drugt = true;
                //             r = Math.random();
                //             if (r < 0.2) {
                //                 kecanduan(0);
                //             }
                //         }
                //     } else if (r < 0.33) {
                //         if (confirm("Kamu ditawar Ganja")) {
                //             updatea(0, -16, 0, 0);
                //             drugt = true;
                //             r = Math.random();
                //             if (r < 0.2) {
                //                 kecanduan(1);
                //             }
                //         }
                //     } else if (r < 0.5) {
                //         if (confirm("Kamu ditawar Opium")) {
                //             updatea(0, -50, 0, 0);
                //             drugt = true;
                //             r = Math.random();
                //             if (r < 0.2) {
                //                 kecanduan(2);
                //             }
                //         }
                //     } else if (r < 0.66) {
                //         if (confirm("Kamu ditawar LSD")) {
                //             updatea(10, -16, 0, 0);
                //             drugt = true;
                //             r = Math.random();
                //             if (r < 0.2) {
                //                 kecanduan(3);
                //             }
                //         }
                //     } else if (r < 0.83) {
                //         if (confirm("Kamu ditawar MDMA")) {
                //             updatea(0, -50, 0, 0);
                //             drugt = true;
                //             r = Math.random();
                //             if (r < 0.2) {
                //                 kecanduan(4);
                //             }
                //         }
                //     } else {
                //         if (confirm("Kamu ditawar Morfin")) {
                //             updatea(0, -50, 0, 0);
                //             drugt = true;
                //             r = Math.random();
                //             if (r < 0.2) {
                //                 kecanduan(5);
                //             }
                //         }
                //     }
                // }
                // if (r < 0.001) {
                //     swal("Korban", "You're struck by lightning!");
                //     r = Math.random();
                //     if (r < 0.5) {
                //         happiness = 100;
                //         health = 100;
                //         smarts = 100;
                //         looks = 100;
                //     } else {
                //         die(4);
                //         happiness = 0;
                //         health = 0;
                //         smarts = 0;
                //         looks = 0;
                //     }
                //     newLine("Aku tersambar petir!");

            } else if (r < 0.355) {
                penyakit(10);
            } else if (r < 0.4) {
                let drugo = rand(0, drugs.length);
                swal.fire({
                    title: "Obat",
                    text: "Kamu ditawar " + drugs[drugo],
                    imageUrl: "images/drug.png",
                    imageWidth: 64,
                    imageHeight: 64,
                    imageAlt: "Obat",
                    showCancelButton: true,
                    confirmButtonColor: "#dc3741",
                    cancelButtonColor: "#7066e0",
                    confirmButtonText: "Ya",
                    cancelButtonText: "Tidak",
                    focusCancel: true
                }).then((result) => {
                    if (result.isConfirmed) {
                        drugt = true;
                        switch (drugo) {
                            case 0:
                            case 2:
                            case 4:
                            case 5:
                            case 6:
                                updatea(0, -50, 0, 0);
                                // if (health < 0) {
                                //     die(5);
                                // }
                                break;
                            case 1:
                                updatea(0, -16, 0, 0);
                                break;
                            case 3:
                                updatea(10, -16, 0, 0);
                        }
                        r = Math.random();
                        if (r < 0.2) {
                            kecanduan(drugo);
                        }
                        newLine("Saya mulai mencoba " + drugs[drugo] + ".");
                    } else {
                        newLine("Saya menolak " + drugs[drugo] + ".");
                    }
                });
            } else if (r < 0.45) {
                let b = rand(0, hewan.length);
                if (o != 6) {
                    swal.fire({
                        title: "Ketemuan",
                        text: "Kamu menemui " + hewan[b] + ".",
                        icon: "warning",
                        showCancelButton: true,
                        showDenyButton: true,
                        cancelButtonText: "Lari menyelamatkan diri!",
                        confirmButtonText: "Mundur perlahan",
                        denyButtonText: "Peliharalah"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            newLine("Saya bertemu dengan seekor " + hewan[b] + ". Saya mundur perlahan.");
                        } else if (result.isDenied) {
                            newLine("Saya bertemu dengan seekor " + hewan[b] + ". Saya memeliharanya.");
                        } else {
                            newLine("Saya bertemu dengan seekor " + hewan[b] + ". Saya menghindarinya.");
                        }
                    });
                }
            } else if (r < 0.46) {
                if (umur >= 40) {
                    penyakit(9);
                }
            } else if (r < 0.55) {
                if (umur >= 60) {
                    r = Math.random();
                    if (r < 0.1) {
                        penyakit(3);
                    } else if (r < 0.5) {
                        penyakit(5);
                    } else {
                        penyakit(11);
                    }
                }
            }
        }
    }
    // } else {
    //     if (umur < 6) {
    //         if (r < 0.35) {
    //             r = Math.random();
    //             if (r < 0.2) {
    //                 penyakit(0);
    //             } else if (r < 0.4) {
    //                 penyakit(1);
    //             } else if (r < 0.6) {
    //                 penyakit(2);
    //             } else if (r < 0.8) {
    //                 penyakit(3);
    //             } else {
    //                 penyakit(6);
    //             }
    //         }
    //     } else if (umur >= 18) {
    //         r = Math.random();
    //         if (r < 0.0001) {
    //             if (o != 6) {
    //                 r = Math.random();
    //                 swal.fire("Korban", "Kamu tersambar gledek!", "warning");
    //                 if (r < 0.5) {
    //                     updatea(-100, -100, -100, -100);
    //                 } else {
    //                     updatea(100, 100, 100, 100);
    //                 }
    //                 newLine("Aku tersambar gledek!");
    //             }

    //         } else if (r < 0.005) {
    //             penyakit(10);
    //         } else if (r < 0.05) {
    //             let drugo = rand(0, drugs.length);
    //             swal.fire({
    //                 title: "Obat",
    //                 text: "Kamu ditawar " + drugs[drugo],
    //                 icon: "warning",
    //                 showCancelButton: true,
    //                 confirmButtonColor: "#dc3741",
    //                 cancelButtonColor: "#7066e0",
    //                 confirmButtonText: "Ya",
    //                 cancelButtonText: "Tidak",
    //                 focusCancel: true
    //             }).then((result) => {
    //                 if (result.isConfirmed) {
    //                     switch (drugo) {
    //                         case 0:
    //                         case 1:
    //                         case 3:
    //                         case 4:
    //                         case 5:
    //                             drugt = true;
    //                             health -= 50;
    //                             if (health < 0) {
    //                                 die(5);
    //                             }
    //                             break;
    //                         case 2:
    //                             drugt = true;
    //                             happiness += 16;
    //                             health -= 16;
    //                     }
    //                     newLine("Saya mulai mencoba " + drugs[drugo] + ".");
    //                 } else {
    //                     newLine("Saya menolak " + drugs[drugo] + ".");
    //                 }
    //             });
    //         } else if (r < 0.1) {
    //             let b = rand(0, hewan.length);
    //             if (o != 6) {
    //                 swal.fire({
    //                     title: "Ketemuan",
    //                     text: "Kamu menemui " + hewan[b] + ".",
    //                     icon: "warning",
    //                     showCancelButton: true,
    //                     showDenyButton: true,
    //                     cancelButtonText: "Lari menyelamatkan diri!",
    //                     denyButtonText: "Mundur perlahan",
    //                     confirmButtonText: "Peliharalah"
    //                 }).then((result) => {
    //                     if (result.isConfirmed) {
    //                         newLine("I encountered a . I retreated slowly.");
    //                     } else if (result.isDenied) {
    //                         newLine("I encountered a . I pet it.");
    //                     } else {
    //                         newLine("I encountered a . I evaded it.");
    //                     }
    //                 });
    //             }
    //         } else if (r < 0.11) {
    //             if (umur >= 40) {
    //                 penyakit(9);
    //             }
    //         } else if (r < 0.2) {
    //             if (umur >= 60) {
    //                 r = Math.random();
    //                 if (r < 0.1) {
    //                     penyakit(3);
    //                 } else if (r < 0.5) {
    //                     penyakit(5);
    //                 } else {
    //                     penyakit(11);
    //                 }
    //             }
    //         }
    //     }
    // }
    // }

    // function kenaBully() {
    //     if (o == 1 || o == 2 || o == 3 | o == 7) {
    //         r = Math.random();
    //         let blfn, blln;
    //         if (r < 0.5) {
    //             blfn = getMaleFN();
    //         } else {
    //             blfn = getFemaleFN();
    //         }
    //         blln = getLN();
    //         swal.fire("Sekolah", "Kamu dibuli oleh " + blfn + " " + blln, {
    //             buttons: {
    //                 cancel: "Do nothing",
    //                 assault: "Assault",
    //                 report: "Report to the headmaster"
    //             }
    //         }).then((value) => {
    //             newLine("I got bullied by " + blfn + " " + blln + ".");
    //             switch (value) {
    //                 case "assault":
    //                     newLine("I assaulted " + blfn + " " + blln + "!");
    //                     break;
    //                 case "report":
    //                     newLine("I reported " + blfn + " " + blln + " to the headmaster.");
    //             }
    //         });
    //     }
    // }

    $("#ageUp").click(function () {
        umur++;
        yeara++;
        simu++;

        uang += 12 * gajib;
        otherEvents = false;
        gyma = false;
        per = false;
        medt = false;
        sosp = false;
        kerjac = false;
        mobilt = false;
        rumaht = false;
        pjk = false;
        drugt = false;
        ageForMessage = "<span class='blue'> Umur: " + umur + " tahun (" + yeara + ")</span>";
        newLine("<br><br>" + ageForMessage);

        if (sosjoin == true) {
            sosmeda++;
            if (follower < 10) {
                // follower+=Math.floor(Math.random()*51)+75;
                follower += rand(75, 51);
            } else {
                if (follower < 500) {
                    followa = Math.random() * 0.2 + 1.1;
                } else if (follower < 1000) {
                    followa = Math.random() * 0.08 + 1.02;
                } else if (follower < 2000) {
                    followa = Math.random() * 0.03 + 1.01;
                } else {
                    followa = Math.random() * 0.015 + 1.005;
                }
                follower = Math.floor(follower * followa);
            }
        }

        if (ul > 0) {
            uang -= ud / 4;
            ul -= ud / 4;
            if (ul <= 0) {
                ul = 0;
            }
        }

        // tiap tahun kecanduan
        if (kec[0] == true) {
            updatea(0, -16, 0, 0);
        }
        if (kec[1] == true) {
            updatea(0, -4, 0, 0);
        }
        if (kec[2] == true) {
            updatea(0, -16, 0, 0);
        }
        if (kec[3] == true) {
            updatea(0, -4, 0, 0);
        }
        if (kec[4] == true) {
            updatea(0, -16, 0, 0);
        }
        if (kec[5] == true) {
            updatea(0, -16, 0, 0);
        }

        // tiap tahun update stats
        if (umur <= 18) {
            updatea(rand(-2, 5), rand(-2, 5), rand(-2, 5), rand(-2, 5));
        } else if (umur <= 40) {
            updatea(rand(-2, 5), rand(-2, 4), rand(-2, 5), rand(-1, 5));
        } else if (umur <= 60) {
            updatea(rand(-3, 6), rand(-3, 5), rand(-2, 5), rand(-3, 4));
        } else if (umur <= 80) {
            updatea(rand(-4, 6), rand(-4, 5), rand(-2, 5), rand(-4, 4));
        } else {
            updatea(rand(-4, 6), rand(-5, 5), rand(-2, 4), rand(-6, 6));
        }

        if (umur >= 60 && died == false) {
            r = Math.random();
            if (umur < 65) {
                if (r < 0.01) {
                    die(rand(0, 3));
                }
            } else if (umur < 75) {
                if (r < 0.02) {
                    die(rand(0, 3));
                }
            } else if (umur < 85) {
                if (r < 0.04) {
                    die(rand(0, 3));
                }
            } else if (umur < 90) {
                if (r < 0.1) {
                    die(rand(0, 3));
                }
            } else {
                if (r < 0.2) {
                    die(rand(0, 3));
                }
            }
        }



        // happy+=rand(-2,5);
        // health+=rand(-2,5);
        // smarts+=rand(-2,5);
        // if(age<18) {
        //     looks+=rand(-2,5);
        // } else if(age<40) {
        //     looks+=rand(-1,5);
        // } else if(age<60) {
        //     looks+=rand(-2,4);
        // } else {
        //     looks+=ran-3,d(,5);
        // }
        // updateb();
        // if(umur>=60) {
        //     r=Math.random();
        //     if(umur<70) {
        //         if(r<0.03) {
        //             die(rand(0,3));
        //         }
        //     } else if(umur<80) {
        //         if(r<0.05) {
        //             die(rand(0,3));
        //         }
        //     } else if(umur<90) {
        //         if(r<0.1) {
        //             die(rand(0,3));
        //         }
        //     } else {
        //         if(r<0.2) {
        //             die(rand(0,3));
        //         }
        //     }
        // }


        if (umur >= 8) {
            $("#krima").attr("class", "tmbl-aktif");
        }
        if (umur >= 10) {
            $("#kr0").attr("class", "tmbl-aktif");
        }
        // YANG UDAH UMUR 12 DAN 18  1 LINE ONLY AWAL!!!
        if (umur >= 12) {
            $("#mind").show();
            // $("#minda").show();
        }
        if (umur >= 13) {
            $("#asseta").attr("class", "tmbl-aktif");
        }
        if (umur >= 14) {
            $("#kr1").attr("class", "tmbl-aktif");
        }
        if (umur >= 16) {
            $("#kr2").attr("class", "tmbl-aktif");
        }
        if (umur >= 17) {
            $("#simb").attr("class", "tmbl-aktif");
        }
        if (umur >= 18) {
            $("#gym").text("Gym (Rp340.000)");
            $("#mobil").attr("class", "tmbl-aktif");
            $("#rumah").attr("class", "tmbl-aktif");
        }
        if (died == false) {
            if (o == 6) {
                pjt--;
                if (pjt == 0) {
                    bebasp();
                }
            }
            for (i = 0; i < hub.length; i++) {
                hubma[i] = false;
                hubim[i] = false;
                hubiw[i] = false;
                hubmi[i] = false;
                if (hub[i] == true) {
                    hubu[i]++;
                    hubr[i] += rand(-2, 4);
                    if (hubr[i] > 100) {
                        hubr[i] = 100;
                    } else if (hubr[i] < 0) {
                        hubr[i] = 0;
                    }
                }
                r = Math.random();
                if (hubu[i] < 65) {
                    if (r < 0.01) {
                        hubmen(i);
                    }
                } else if (hubu[i] < 75) {
                    if (r < 0.02) {
                        hubmen(i);
                    }
                } else if (hubu[i] < 85) {
                    if (r < 0.04) {
                        hubmen(i);
                    }
                } else if (hubu[i] < 90) {
                    if (r < 0.1) {
                        hubmen(i);
                    }
                } else if (r < 0.2) {
                    hubmen(i);
                }
                // for (i = 0; i < rl.length; i++) {
                //     if (rl[i] == true) {
                //         rlage[i]++;
                //         r = Math.random();
                //         if (rlage[i] < 65) {
                //             if (r < 0.01) {
                //                 rlDie(i);
                //             }
                //         } else if (rlage[i] < 75) {
                //             if (r < 0.02) {
                //                 rlDie(i);
                //             }
                //         } else if (rlage[i] < 85) {
                //             if (r < 0.04) {
                //                 rlDie(i);
                //             }
                //         } else {
                //             if (r < 0.1) {
                //                 rlDie(i);
                //             }
                //         }
                //     }
                // }
            }
            if (isp[0] == true) {
                updatea(0, -15, 0, 0);
                penh[0] -= 20;
            }
            if (isp[1] == true) {
                updatea(0, -15, 0, 0);
                penh[1] -= 20;
            }
            if (isp[2] == true) {
                updatea(0, -15, 0, 0);
                penh[2] -= 20;
            }
            if (isp[3] == true) {
                if (umur < 6) {
                    updatea(0, -35, 0, 0);
                } else if (umur < 12) {
                    updatea(0, -10, 0, 0);
                } else if (umur < 18) {
                    updatea(0, -5, 0, 0);
                } else {
                    updatea(0, -1, 0, 0);
                }
                penh[3] += 50;
            }
            if (isp[4] == true) {
                updatea(0, -8, 0, 0);
                penh[4] -= 100;
            }
            if (isp[5] == true) {
                updatea(0, -8, 0, 0);
                penh[5] -= 50;
            }
            if (isp[6] == true) {
                updatea(0, -5, 0, 0);
                penh[6] -= 100;
            }
            if (isp[7] == true) {
                updatea(0, -3, 0, 0);
                penh[7] -= 100;
            }
            if (isp[8] == true) {
                updatea(0, -3, 0, 0);
                penh[8] -= 100;
            }
            if (isp[9] == true) {
                updatea(0, -3, 0, 0);
            }
            if (isp[10] == true) {
                updatea(0, -15, 0, 0);
                penh[10] -= 30;
            }
            if (isp[11] == true) {
                updatea(0, -5, 0, 0);
                penh[11] -= 3;
            }
            update();

            r = Math.random();
            if (yeara == 2020 && r < 0.05) {
                penyakit(4);
            }
            if (yeara == 2021 && r < 0.15) {
                penyakit(4);
            }
            if (yeara == 2022 && r < 0.1) {
                penyakit(4);
            }
            // for (i = 0; i < rl.length; i++) {
            //     if (rl[i] == true) {
            //         rlage[i]++;
            //         r = Math.random();
            //         if (rlage[i] < 65) {
            //             if (r < 0.01) {
            //                 rlDie(i);
            //             }
            //         } else if (rlage[i] < 75) {
            //             if (r < 0.02) {
            //                 rlDie(i);
            //             }
            //         } else if (rlage[i] < 85) {
            //             if (r < 0.04) {
            //                 rlDie(i);
            //             }
            //         } else {
            //             if (r < 0.1) {
            //                 rlDie(i);
            //             }
            //         }
            //     }
            // }
            if (bekerja == true) {
                kerjat++;
                naikGaji();
                if (umur >= 65 && bekerja == true) {
                    otherEvents = true;
                    bekerja = false;
                    gajib = gajib * 0.5;
                    swal.fire("Pekerjaan", "Kamu harus pensiun. Gaji per bulan Rp" + Math.floor(gajib) + ".", "success");
                    newLine("Saya harus pensiun. Gaji per bulan Rp" + Math.floor(gajib) + ".");
                    updatea(20, 0, 0, 0);
                    o = 8;
                }
            }
            if (mobilp == true) {
                mobilu++;
                mobilh = mobilh * 0.8;
                // mobilk+=rand(5)-5;
                mobilk += rand(-5, 5);
                if (mobilk <= 0) {
                    otherEvents = true;
                    swal.fire("Ups...", "Kamu harus membuang mobil!", "error");
                    newLine("Saya harus membuang mobil!");
                    mobilp = false;
                }
                if (mobill > 0) {
                    uang -= mobild / 5;
                    mobill -= mobild / 5;
                    if (mobill <= 0) {
                        mobill = 0;
                    }
                }
            }
            if (rumahp == true) {
                rumahu++;
                rumahh = rumahh * 1.01;
                // rumahk+=rand(2)-1;
                rumahk += rand(-1, 2);
                if (rumahl > 0) {
                    uang -= rumahd / 20;
                    rumahl -= rumahd / 20;
                    if (rumahl <= 0) {
                        rumahl = 0;
                    }
                }
            }
            if (o == 7) {
                ua++;
            }
            if (o == 3) {
                smka++;
            }
            if (umur >= 6 && o != 6) {
                if (umur < 12) {
                    if (o == 0 || o == 4) {
                        otherEvents = true;
                        sd = rand(1, 300);
                        o = 1;
                        swal.fire("Sekolah", "Kamu bersekolah di SDN " + sd + " " + kota + ".", "info");
                        newLine("Saya bersekolah di SDN " + sd + " " + kota + ".");
                    }
                } else if (umur < 15) {
                    if (o == 1 || o == 4) {
                        otherEvents = true;
                        updatea(0, 0, 2, 0);
                        if (kota == "Jakarta") {
                            smp = rand(1, 295);
                        } else {
                            smp = rand(1, 9);
                        }
                        o = 2;
                        swal.fire("Sekolah", "Kamu bersekolah di SMPN " + smp + " " + kota + ".", "info");
                        newLine("Kamu bersekolah di SMPN " + smp + " " + kota + ".");
                    }
                } else if (umur < 18) {
                    if (o == 2) {
                        otherEvents = true;
                        updatea(0, 0, 3, 0);
                        r = Math.random();
                        if (r < 0.7 || smarts < 25) {
                            sman = "SMAN";
                        } else {
                            sman = "SMKN";
                        }
                        if (kota == "Jakarta") {
                            if (sman == "SMAN") {
                                sma = rand(1, 117);
                            } else {
                                sma = rand(1, 74);
                            }
                        } else {
                            if (sman == "SMAN") {
                                sma = rand(1, 5);
                            } else {
                                sma = rand(1, 3);
                            }
                        }
                        o = 3;
                        swal.fire("Sekolah", "Kamu bersekolah di " + sman + " " + sma + " " + kota + ".", "info");
                        newLine("Saya bersekolah di " + sman + " " + sma + " " + kota + ".");
                    }
                } else if (o == 3 && smka >= 3) {
                    otherEvents = true;
                    learn++;
                    updatea(0, 0, 3, 0);
                    o = 4;
                    swal.fire({
                        title: "Sekolah",
                        text: "Kamu lulus dari " + sman + " " + sma + " " + kota + ".",
                        icon: "success",
                        showDenyButton: true,
                        showCancelButton: true,
                        confirmButtonText: "Pergi ke universitas",
                        denyButtonText: "Cari kerja",
                        cancelButtonText: "Ambil cuti"
                    }).then((result) => {
                        newLine("Saya lulus dari " + sman + " " + sma + " " + kota + ".");
                        if (result.isConfirmed) {
                            univ();
                            newLine("Saya kuliah di universitas.");
                        } else if (result.isDenied) {
                            // browse jobs
                            newLine("Saya memutuskan untuk melihat-lihat beberapa lowongan pekerjaan.");
                        } else {
                            newLine("Saya memutuskan untuk mengambil cuti beberapa waktu.");
                        }
                    });
                } else if (o == 7 && ua >= 4) {
                    otherEvents = true;
                    learn++;
                    updatea(0, 0, 10, 0);
                    o = 4;
                    if (ue == 1) {
                        ud = 450000000;
                        ul = ud;
                        uang -= ud / 4;
                        ul -= ud / 4;
                    }
                    swal.fire("Universitas", "Kamu telah lulus dari universitas.", "success");
                    newLine("Saya lulus dari universitas.");
                }
                if (umur == 17) {
                    otherEvents = true;
                    swal.fire({
                        title: "SIM",
                        text: "Dapet SIM?",
                        icon: "question",
                        showCancelButton: true,
                        confirmButtonText: "Ya",
                        cancelButtonText: "Tidak"
                    }).then((result) => {
                        if (result.isConfirmed) {
                            if (smarts >= 50) {
                                swal.fire("SIM", "Kamu sudah mendapatkan SIM!", "success");
                                newLine("Saya lolos ujian SIM!");
                                sim = true;
                                simu = 0;
                                updatea(10, 0, 0, 0);
                            } else {
                                simb = true;
                                tolak(-10);
                                newLine("Saya gagal ujian SIM!");
                            }
                        }
                    });
                }
            }
            if (otherEvents == false) {
                randomEvents();
            }
        }
        update();
    });

    function penyakit(a) {
        if (isp[a] == false) {
            otherEvents = true;
            isp[a] = true;
            swal.fire("Penyakit", "Kamu terkena " + peny[a] + ".", "warning");
            newLine("Saya didiagnosis menderita " + peny[a] + ".");
            switch (a) {
                case 0:
                case 1:
                case 2:
                case 4:
                case 7:
                case 8:
                case 11:
                    penh[a] = Math.random() * 100;
                    break;
                case 3:
                case 5:
                case 9:
                    penh[a] = Math.random() * 3000 + 1000;
                    break;
                case 6:
                    penh[a] = Math.random() * 1500 + 500;
                    break;
                case 10:
                    penh[a] = Math.random() * 420 + 80;
            }
        }
    }

    $("#dokter").click(function () {
        swal.fire({
            title: "Dokter",
            text: "Kunjungi dokter?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Ya",
            cancelButtonText: "Tidak"
        }).then((result) => {
            if (result.isConfirmed) {
                for (i = 0; i < peny.length; i++) {
                    if (penh[i] > 0) {
                        penh[i] -= 100;
                    }
                }
                newLine("Saya mengunjungi dokter.");
                update();
            }
        });
    });

    for (i = 0; i < hub.length; i++) {

        $("#hubungana" + i + "-0").click(function () {
            hubr[i] -= 50;
            newLine("Saya mengantemi " + huba[i] + ".");
            back();
        });

        $("#hubungana" + i + "-1").click(function () {
            let b = rand(0, hina.length);
            Swal.fire({
                icon: "warning",
                title: hubak[i],
                text: "Aku panggil dia " + hina[b] + ".",
                showConfirmButton: false,
                timer: 1500
            });
            // swal.fire(hubak[i], "Aku panggil dia " + hina[b] + ".", "warning");
            hubr[i] -= 10;
            newLine("Saya memanggil " + huba[i] + " " + hina[b] + ".");
            back();
        });

        $("#hubungana" + i + "-2").click(function () {
            // swal.fire({
            //     title:hubak[i],
            //     icon:"question",
            //     inputLabel:"Memberi uang",
            //     inputAttributes: {
            //         min: "1000",
            //         max: "10000000",
            //         step: "1000"
            //     }
            // });
            Swal.fire({
                title: hubak[i],
                icon: 'question',
                input: 'range',
                inputLabel: 'Memberi uang',
                inputAttributes: {
                    min: 500,
                    max: 1000000000,
                    step: 500
                },
                inputValue: 1000000
            }).then((result) => {
                if (result.isConfirmed) {
                    hubme = result.value;
                    // console.log("Nilai akhir yang dipilih:", nilaiPilihan);
                    // Swal.fire({
                    // title: 'Tersimpan!',
                    // text: `Anda telah memilih nilai: ${nilaiPilihan}`,
                    // icon: 'success'
                    // });
                    if (uang >= hubme) {
                        if (hubma[i] == false) {
                            hubma[i] = true;
                            if (hubme < 1000000) {
                                hubr[i] += 1;
                            } else if (hubme < 10000000) {
                                hubr[i] += 2;
                            } else if (hubme < 100000000) {
                                hubr[i] += 5;
                            } else if (hubme < 500000000) {
                                hubr[i] += 10;
                            } else {
                                hubr[i] += 15;
                            }
                        }
                        newLine("Saya memberi uang ke " + huba[i] + " sebesar Rp" + hubme);
                    }
                    uanga(hubme);
                    back();
                }
            });

            // hubme = parseInt(prompt("Memberi uang"));
            // if (uang >= hubme && hubma[i] == false) {
            //     hubma[i] = true;
            //     if (hubme < 1000000) {
            //         hubr[i] += 1;
            //     } else if (hubme < 10000000) {
            //         hubr[i] += 2;
            //     } else if (hubme < 100000000) {
            //         hubr[i] += 5;
            //     } else if (hubme < 500000000) {
            //         hubr[i] += 10;
            //     } else {
            //         hubr[i] += 15;
            //     }
            // }
            // uanga(hubme);
        });

        $("#hubungana" + i + "-3").click(function () {
            b = rand(0, muji.length);
            Swal.fire({
                icon: "info",
                title: hubak[i],
                text: "Saya panggil dia " + muji[b] + ".",
                showConfirmButton: false,
                timer: 1500
            });
            // swal.fire(hubak[i], "Saya panggil dia " + muji[b] + ".", "info");
            if (hubim[i] == false) {
                hubim[i] = true;
                hubr[i] += 10;
            }
            newLine("Saya memanggil " + huba[i] + " " + muji[b] + ".");
            back();
        });

        $("#hubungana" + i + "-4").click(function () {
            if (hubr[i] >= 10) {
                b = rand(0, hbswk.length);
                Swal.fire({
                    icon: "info",
                    title: hubak[i],
                    text: "Saya mengajak " + huba[i] + " saya, " + fnamal[i] + " " + hbswk[b] + ".",
                    showConfirmButton: false,
                    timer: 1500
                });
                // swal.fire(hubak[i], "Saya mengajak " + huba[i] + " saya, " + fnamal[i] + " " + hbswk[b] + ".", "info");
                if (hubiw[i] == false) {
                    hubiw[i] = true;
                    if (hubr[i] >= 10) {
                        updatea(5, 0, 0, 0);
                        hubr[i] += 10;
                    }
                }
                newLine("Saya mengajak " + huba[i] + " saya, " + fnamal[i] + " " + hbswk[b] + ".");
            } else {
                Swal.fire({
                    icon: "error",
                    title: hubak[i],
                    text: "Dia tidak mau menghabiskan waktu bersamamu.",
                    showConfirmButton: false,
                    timer: 1500
                });
                // swal.fire(hubak[i], "Dia tidak mau menghabiskan waktu bersamamu.", "error");
                updatea(-10, 0, 0, 0);
                let pesan = [hubak[i] + " saya, " + fnamal[i] + ", tidak mau bertemu saya.",
                hubak[i] + " saya, " + fnamal[i] + ", enggan menemui saya.",
                hubak[i] + " saya, " + fnamal[i] + ", tidak mau menghabiskan waktu bersama saya."];
                newLine(pesan[rand(0, pesan.length)]);
            }
            back();
        });

        $("hubungana" + i + "-5").click(function () {
            if (hubr[i] >= 10 && hubm[i] >= 10 && hubmi[i] == false) {
                hubmi[i] = true;
                humb = (rand(1000, 9000)) * hubm[i];
                if (umur >= 18) {
                    humb = humb * 10;
                }
                uang += humb;
                Swal.fire({
                    icon: "info",
                    title: hubak[i],
                    text: "Dia memberimu uang sebesar Rp" + humb,
                    showConfirmButton: false,
                    timer: 1500
                });
                // swal.fire(hubak[i], "Dia memberimu uang sebesar Rp" + humb, "info");
                hubr[i] -= 5;
                newLine("Saya meminta uang ke " + huba[i] + " sebesar Rp" + humb);
            } else {
                Swal.fire({
                    icon: "error",
                    title: hubak[i],
                    text: "Dia tidak mau memberimu uang.",
                    showConfirmButton: false,
                    timer: 1500
                });
                // swal.fire(hubak[i], "Dia tidak mau memberimu uang.", "error");
                hubr[i] -= 10;
                update();
            }
            back();
        });
    }

    // function hubungana(a, b) {
    //     switch (b) {
    //         case 0:
    //             hubr[a] -= 50;
    //             break;
    //         case 1:
    //             alert("Aku panggil dia " + hina[rand(0, hina.length)] + ".")
    //             hubr[a] -= 10;
    //             break;
    //         case 2:
    //             hubme = parseInt(prompt("Memberi uang"));
    //             if (uang >= hubme && hubma[a] == false) {
    //                 hubma[a] = true;
    //                 if (hubme < 1000000) {
    //                     hubr[a] += 1;
    //                 } else if (hubme < 10000000) {
    //                     hubr[a] += 2;
    //                 } else if (hubme < 100000000) {
    //                     hubr[a] += 5;
    //                 } else if (hubme < 500000000) {
    //                     hubr[a] += 10;
    //                 } else {
    //                     hubr[a] += 15;
    //                 }
    //             }
    //             uanga(hubme);
    //             break;
    //         case 3:
    //             if (hubim[a] == false) {
    //                 hubim[a] = true;
    //                 hubr[a] += 10;
    //             }
    //             break;
    //         case 4:
    //             if (hubiw[a] == false) {
    //                 hubiw[a] = true;
    //                 if (hubr[a] >= 10) {
    //                     updatea(5, 0, 0, 0);
    //                     hubr[a] += 10;
    //                 }
    //             }
    //             if (hubr[a] < 10) {
    //                 alert("Dia tidak mau menghabiskan waktu bersamamu.");
    //                 updatea(-10, 0, 0, 0);
    //             }
    //             break;
    //         case 5:
    //             if (hubr[a] >= 10 && hubm[a] >= 10 && hubmi[a] == false) {
    //                 hubmi[a] = true;
    //                 humb = (rand(1000, 9000)) * hubm[a];
    //                 if (umur >= 18) {
    //                     humb = humb * 10;
    //                 }
    //                 uang += humb;
    //                 alert("Dia memberimu uang sebesar Rp" + humb);
    //                 hubr[a] -= 5;
    //             } else {
    //                 alert("Dia tidak mau memberimu uang.");
    //                 hubr[a] -= 10;
    //             }
    //     }
    //     if (hubr[a] < 0) {
    //         hubr[a] = 0;
    //     } else if (hubr[a] > 100) {
    //         hubr[a] = 100;
    //     }
    //     back();
    //     update();
    // }

    function hubmen(a) {
        if (hub[a] == true) {
            otherEvents = true;
            hub[a] = false;
            let pesan;
            updatea(-50, 0, 0, 0);
            newLine(hubak[a] + " saya meninggal.");
            if (hubr[a] > 30 && hubm[a] >= 10) {
                humb = rand(10000000, 100000000) * hubm[a];
                uang += humb;
                pesan = hubak[a] + "mu, " + hubn[a] + " sudah meninggal! Kamu diwariskan Rp" + humb + ".";
                updatea(10, 0, 0, 0);
            } else {
                pesan = hubak[a] + "mu, " + hubn[a] + " sudah meninggal!";
            }
            swal.fire({
                title: "Kematian",
                text: pesan,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#dc3741",
                cancelButtonColor: "#7066e0",
                confirmButtonText: "Abaikan pemakaman",
                cancelButtonText: "Hadiri pemakaman",
                focusCancel: true
            }).then((result) => {
                if (result.isConfirmed) {
                    newLine("Saya tidak bisa menghadiri pemakamannya.");
                } else {
                    newLine("Saya menghadiri pemakaman tersebut.");
                }
            });
        }
    }

    function serangan() {
        r = Math.random();
        if (r < 0.4) {
            Swal.fire({
                icon: "warning",
                title: "Konflik",
                text: "Awwww",
                showConfirmButton: false,
                timer: 1500
            });
            // swal.fire("Konflik", "Awwww", "warning");
            window.navigator.vibrate(500);
            updatea(-10, -4, 0, 0);
        } else if (r < 0.7) {
            Swal.fire({
                icon: "warning",
                title: "Konflik",
                text: "Awwww",
                showConfirmButton: false,
                timer: 1500
            });
            // swal.fire("Konflik", "Awwww", "warning");
            window.navigator.vibrate(500);
            updatea(-10, -8, 0, 0);
        } else if (r < 0.9) {
            Swal.fire({
                icon: "warning",
                title: "Konflik",
                text: "Awwww",
                showConfirmButton: false,
                timer: 1500
            });
            // swal.fire("Konflik", "Awwww", "warning");
            window.navigator.vibrate(1000);
            updatea(-10, -15, 0, 0);
        } else if (r < 0.99) {
            Swal.fire({
                icon: "warning",
                title: "Konflik",
                text: "Awwww",
                showConfirmButton: false,
                timer: 1500
            });
            // swal.fire("Konflik", "Awwww", "warning");
            window.navigator.vibrate(1500);
            updatea(-10, -30, 0, 0);
        } else {
            r = Math.random();
            if (r < 0.5) {
                swal.fire("Konflik", "Kamu berhasil menghindar.", "success");
            } else if (r < 0.8) {
                Swal.fire({
                    icon: "warning",
                    title: "Konflik",
                    text: "Awwww",
                    showConfirmButton: false,
                    timer: 1500
                });
                // swal.fire("Konflik", "Awwww", "warning");
                window.navigator.vibrate(2000);
                updatea(-50, -50, 0, 0);
            } else {
                Swal.fire({
                    icon: "warning",
                    title: "Konflik",
                    text: "Awwww",
                    showConfirmButton: false,
                    timer: 1500
                });
                // swal.fire("Konflik", "Awwww", "warning");
                window.navigator.vibrate(2000);
                updatea(-50, -100, 0, 0);
            }
        }
    }

    $("#back").click(function () {
        back();
    });

    function back() {
        $("#game").show();
        $("#menu").show();
        $("#pekerjaan").hide();
        $("#mind").hide();
        $("#asset").hide();
        $("#hubungan").hide();
        $("#krime").hide();
    }

    $("#pekerjaan").click(function () {
        if (umur >= 6) {
            $("#game").show();
            $("#menu").hide();
            $("#pekerjaan").show();
            $("#kerjaan").hide();
        }
    });

    $("#mind").click(function () {
        if (umur >= 12) {
            $("#menu").hide();
            $("#mind").show();
        }
    });

    $("#asset").click(function () {
        if (umur >= 13) {
            $("#game").show();
            $("#menu").hide();
            $("#asset").show();
            $("#mobila").hide();
            $("#rumaha").hide();
        }
    });

    $("#krima").click(function () {
        if (umur >= 8) {
            $("#menu").hide();
            $("#krime").show();
        }
    });

    function kriminal(a) {
        switch (a) {
            case 0:
                if (umur >= 10) {
                    for (i = 0; i < 3; i++) {
                        kraa[i] = rand(75) + 25;
                        if (kraa[i] < 50) {
                            krab[i] = rand(51);
                        } else if (kraa[i] < 75) {
                            krab[i] = rand(61);
                        } else if (kraa[i] < 85) {
                            krab[i] = rand(71);
                        } else if (kraa[i] < 90) {
                            krab[i] = rand(81);
                        } else if (kraa[i] < 95) {
                            krab[i] = rand(91);
                        } else {
                            krab[i] = rand(101);
                        }
                        krac[i] = rand(1000) / 100;
                    }
                    kra = prompt("Pilih target:\n1 = Keamanan: " + kraa[0] + "%, Harta: " + krab[0] + "%, Jarak: " + krac[0] + " km\n2 = Keamanan: " + kraa[1] + "%, Harta: " + krab[1] + "%, Jarak: " + krac[1] + " km\n3 = Keamanan: " + kraa[2] + "%, Harta: " + krab[2] + "%, Jarak: " + krac[2] + " km");
                    switch (kra) {
                        case "1":
                        case "2":
                        case "3":
                            r = Math.random();
                            if (r > kraa[parseInt(kra, 10) - 1] / 100) {
                                krb = (rand(900000) + 100000) * krab[parseInt(kra, 10) - 1];
                                uang += krb;
                                alert("Kamu berhasil, kamu membawa pulang uang sebesar Rp" + krb + ".");
                            } else {
                                r = Math.random();
                                if (r < 0.3) {
                                    if (smarts >= 50) {
                                        alert("Kamu gagal, kamu sudah melarikan diri sebelum ada polisi.");
                                    } else {
                                        alert("Kamu gagal. Pemilik rumah memanggil polisi.");
                                        masukp(rand(11) + 5);
                                    }
                                } else if (r < 0.5 && rkr == false) {
                                    alert("Kamu gagal. Pemilik rumah menyerangmu.");
                                    serangan();
                                } else {
                                    alert("Kamu gagal. Pemilik rumah memanggil polisi.");
                                    masukp(rand(11) + 5);
                                }
                            }
                    }
                }
                break;
            case 1:
                if (umur >= 14) {

                }
                break;
            case 2:
                if (umur >= 16) {

                }
                break;
            case 3:
                for (i = 0; i < 5; i++) {
                    r = Math.random();
                    if (r < 0.1) {
                        kraa[i] = rand(1001) * 1000;
                    } else if (r < 0.3) {
                        kraa[i] = rand(501) * 1000;
                    } else if (r < 0.5) {
                        kraa[i] = rand(101) * 1000;
                    } else if (r < 0.7) {
                        kraa[i] = rand(11) * 1000;
                    } else {
                        kraa[i] = 0;
                    }
                }
                kra = prompt("Pilih target: 1, 2, 3, 4, 5");
                switch (kra) {
                    case "1":
                    case "2":
                    case "3":
                    case "4":
                    case "5":
                        r = Math.random();
                        if (r < 0.5) {
                            krb = kraa[parseInt(kra, 10) - 1];
                            uang += krb;
                            if (krb > 0) {
                                alert("Kamu berhasil mencopet Rp" + krb + ".");
                            } else {
                                alert("Kamu berhasil tapi isi dompet kosong.");
                            }
                        } else {
                            r = Math.random();
                            if (r < 0.5 && rkr == false) {
                                alert("Kamu gagal. Si korban sudah lari duluan.");
                            } else if (r < 0.7 && rkr == false) {
                                alert("Kamu gagal. Si korban menyerangmu.");
                                serangan();
                            } else {
                                alert("Kamu gagal. Si korban memanggil polisi.");
                                masukp(rand(4) + 1);
                            }
                        }
                }
        }
        update();
    }

    function masukp(a) {
        penjara = true;
        rkr = true;
        pjt += a;
        alert("Kamu dipenjara selama " + pjt + " tahun.");
        if (bekerja == true) {
            pecat("Rekor kriminal");
        }
        back();
        $("#menu").hide();
        $("#pj").show();
        status = "Di penjara";
        updatea(-100, 0, 0, 0);
        update();
    }

    function kabur() {
        if (pjk == false) {
            if (confirm("Mau kabur dari penjara?")) {
                r = Math.random();
                if (r < 0.7 && smarts >= 90) {
                    bebasp();
                } else if (r < 0.5 && smarts >= 70) {
                    bebasp();
                } else if (r < 0.3 && smarts >= 50) {
                    bebasp();
                } else if (r < 0.2 && smarts >= 30) {
                    bebasp();
                } else if (r < 0.1 && smarts >= 10) {
                    bebasp();
                } else {
                    pjt += rand(4) + 2;
                    alert("Kamu ketangkap dan hukuman ditambah menjadi " + pjt + " tahun.");
                    pjk = true;
                    updatea(-10, 0, 0, 0);
                }
            }
        } else {
            alert("Kamu tidak bisa mencari cara untuk kabur.");
        }
        update();
    }

    function rusuh() {
        if (confirm("Memulai kerusuhan?")) {
            r = Math.random();
            if (r < 0.25) {
                alert("Kamu memulai kerusuhan\n" + (rand(41) + 10) + " orang terluka");
            } else if (r < 0.5) {
                alert("Kamu memulai kerusuhan\n" + (rand(41) + 10) + " orang terluka\n" + (rand(5) + 1) + " orang meninggal dunia");
            } else if (r < 0.75) {
                alert("Kamu memulai kerusuhan\n" + (rand(41) + 10) + " orang terluka\nKamu diserang.");
                serangan();
            } else {
                alert("Kamu memulai kerusuhan\n" + (rand(41) + 10) + " orang terluka\n" + (rand(5) + 1) + " orang meninggal dunia\nKamu diserang.");
                serangan();
            }
            r = Math.random();
            if (r < 0.3) {
                pjt += rand(2) + 1;
                alert("Hukuman ditambah menjadi " + pjt + " tahun.");
                updatea(-10, 0, 0, 0);
            }
            update();
        }
    }

    function bebasp() {
        otherEvents = true;
        swal.fire("Penjara", "Kamu bebas dari penjara.", "success");
        newLine("Saya bebas dari penjara.");
        o = 4;
        updatea(20, 0, 0, 0);
        $("#pj").hide();
        $("#menu").show();
    }

    function ged() {
        if (umur >= 15 && smka < 3) {
            if (status == "Tidak bekerja" || status == "Bekerja" || status == "Pensiun") {
                if (uang >= 15000000) {
                    alert("Kamu lulus tes GED!");
                    smka = 3;
                    $("#ged").attr("class", "");
                }
                uanga(15000000);
                update();
            }
        }
    }

    function univ() {
        if (umur >= 18) {
            if (status == "Tidak bekerja" && ua < 4) {
                if (smarts >= 25 && smka >= 3) {
                    $("#game").hide();
                    $("#univer").show();

                } else {
                    tolak(0);
                }
                update();
            }
        }
    }

    function univer(a) {
        u = a;
        universitas();
    }

    function universitas() {
        $("#un").html("Jurusan: " + uc[u]);
        $("#univer").hide();
        $("#univers").show();
    }

    function univers(a) {
        ue = a;
        switch (ue) {
            case 0:
                if (smarts >= 90) {
                    $("#univers").hide();
                    $("#game").show();
                    status = "Universitas";
                } else {
                    tolak(0);
                }
                break;
            case 1:
                $("#univers").hide();
                $("#game").show();
                status = "Universitas";
                break;
            case 2:
                $("#univers").hide();
                $("#univer").show();
                break;
            case 3:
                $("#univers").hide();
                $("#game").show();
                status = "Tidak bekerja";
        }
        update();
    }

    $("#tombol-1").click(function () {
        $("#game").hide();
        $("#hubungan").show();
        for (i = 0; i < 2; i++) {
            if (hub[i] == true) {
                if (hubr[i] <= 15) {
                    document.getElementById('hub' + i).html('Umur: ' + hubu[i] + ' tahun<br>Hubungan:<br><div class="statsa" style="width:100%"><div class="stats" style="width:' + hubr[i] + '%;background:#ff0000"></div></div>');
                } else if (hubr[i] <= 30) {
                    document.getElementById('hub' + i).html('Umur: ' + hubu[i] + ' tahun<br>Hubungan:<br><div class="statsa" style="width:100%"><div class="stats" style="width:' + hubr[i] + '%;background:#ffa500"></div></div>');
                } else {
                    document.getElementById('hub' + i).html('Umur: ' + hubu[i] + ' tahun<br>Hubungan:<br><div class="statsa" style="width:100%"><div class="stats" style="width:' + hubr[i] + '%;background:#00ff00"></div></div>');
                }
                if (hubm[i] <= 15) {
                    document.getElementById('hubm' + i).html('Pekerjaan: ' + hubk[i] + '<br>Uang:<br><div class="statsa" style="width:100%"><div class="stats" style="width:' + hubm[i] + '%;background:#ff0000"></div></div>');
                } else if (hubm[i] <= 30) {
                    document.getElementById('hubm' + i).html('Pekerjaan: ' + hubk[i] + '<br>Uang:<br><div class="statsa" style="width:100%"><div class="stats" style="width:' + hubm[i] + '%;background:#ffa500"></div></div>');
                } else {
                    document.getElementById('hubm' + i).html('Pekerjaan: ' + hubk[i] + '<br>Uang:<br><div class="statsa" style="width:100%"><div class="stats" style="width:' + hubm[i] + '%;background:#00ff00"></div></div>');
                }
                if (umur < 6) {
                    $("#huba" + i).hide();
                } else {
                    $("#huba" + i).show();
                }
            } else {
                $("#hub" + i).html("<i>Sudah meninggal dunia.</i>");
                $("#hubm" + i).hide();
                $("#huba" + i).hide();
            }
        }
    });

    function kerja() {
        if (umur < 15) {
            if (umur >= 6) {
                alert("Orang tuamu tidak memperbolehkan kamu berhenti sekolah.");
            }
        } else if (status == "SMA") {
            smka = 0;
            alert("Kamu berhenti sekolah.");
            $("#ged").attr("class", "tmbl-aktif");
            status = "Tidak bekerja";
        } else if (status == "Universitas") {
            ua = 0;
            alert("Kamu berhenti sekolah.");
            status = "Tidak bekerja";
        } else if (umur < 65) {
            if (bekerja == false) {
                $("#game").hide();
                $("#kerjaan").show();
                kerjaan();
            } else {
                bekerja = false;
                gajib = 0;
                kerjat = 0;
                alert("Kamu sudah berhenti kerja.");
                status = "Tidak bekerja";
            }
        } else {
            alert("Kamu terlalu tua untuk bekerja!");
        }
        update();
    }

    function kerjaan() {
        if (kerjac == false) {
            kerjac = true;
            for (i = 0; i < 8; i++) {
                kerjam = document.createElement("div");
                kerjam.attr("class", "menuc");
                kerjam.html('<p><b id="kerja' + i + '"></b></p><p id="gaji' + i + '"></p><button onclick="kerjaa(' + i + ')" class="tmbl-aktif">Kerja</button>');
                kerjar[i] = Math.floor(Math.random() * kerjad.length);
                gaji[i] = Math.floor(Math.random() * 0.3 * gmin[kerjar[i]]) + gmin[kerjar[i]];
                if (kerjan == false) {
                    $("#kerjaan").appendChild(kerjam);
                }
                if (i == 7) {
                    kerjan = true;
                }
                $("#kerja" + i).html(kerjad[kerjar[i]]);
                $("#gaji" + i).html("Karir: " + kerjad[karird[kerjar[i]]] + "<br>Gaji/bulan: Rp" + gaji[i]);
            }
        }
    }

    function kerjaa(a) {
        i = a;
        kerjab = kerjar[a];
        switch (kerjab) {
            case 0:
                if (ua >= 4 && drugt == false && rkr == false) {
                    if (u == 6 || u == 9) {
                        dapatKerja();
                    } else {
                        tolak(-10);
                    }
                } else {
                    tolak(-10);
                }
                break;
            case 1:
                if (ua >= 4 && u == 2 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 2:
                if (ua >= 4 && drugt == false && rkr == false) {
                    if (u == 6 || u == 9) {
                        dapatKerja();
                    } else {
                        tolak(-10);
                    }
                } else {
                    tolak(-10);
                }
                break;
            case 3:
                if (happy >= 50 && health >= 50 && smka >= 3 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 4:
                if (happy >= 30 && health >= 30 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 5:
                dapatKerja();
                break;
            case 6:
                if (happy >= 50 && health >= 50 && smka >= 3 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 7:
                if (happy >= 50 && health >= 50 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 8:
                if (drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 9:
                if (pk[0] >= 1 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 10:
                if (pk[0] >= 2 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 11:
                if (ua >= 4 && u == 2 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 12:
                if (pk[1] >= 2 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 13:
                if (ua >= 4 && drugt == false && rkr == false) {
                    if (u == 6 || u == 9) {
                        dapatKerja();
                    }
                } else {
                    tolak(-10);
                }
                break;
            case 14:
                if (pk[2] >= 1 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 15:
                if (smka >= 3 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 16:
                if (pk[3] >= 1 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 17:
                if (smka >= 3 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
                break;
            case 18:
                if (pk[4] >= 1 && drugt == false && rkr == false) {
                    dapatKerja();
                } else {
                    tolak(-10);
                }
        }
        update();
    }

    function dapatKerja() {
        updatea(10, 0, 0, 0);
        gajib = gaji[i];
        alert("Kamu mendapat pekerjaan sebagai " + kerjad[kerjab] + ". Gaji per bulan Rp" + Math.floor(gajib) + ".");
        bekerja = true;
        status = "Bekerja";
        pekerjaan();
    }

    function naikGaji() {
        if (kerjat == 5 || kerjat == 10 || kerjat == 15 || kerjat == 20 || kerjat == 25 || kerjat == 30 || kerjat == 35 || kerjat == 40 || kerjat == 45) {
            gajia = Math.random() * 0.05 + 1.05;
            gajib = gajib * gajia;
        }
        if (drugt == true) {
            if (kerjab <= 4) {
                pecat("Gagal tes narkoba");
            }
            if (kerjab >= 6) {
                pecat("Gagal tes narkoba");
            }
        }
        if (happy < 30 || health < 30) {
            if (kerjab == 3 || kerjab == 4 || kerjab == 6 || kerjab == 7) {
                pecat("Perfomance");
            }
        }
        if (kerjab == 0 && kerjat == 3) {
            pk[0] = 1;
            naikPangkat(9);
        }
        if (kerjab == 9 && kerjat == 3) {
            pk[0] = 2;
            naikPangkat(10);
        }
        if (kerjab == 1 && kerjat == 3) {
            naikPangkat(11);
        }
        if (kerjab == 11 && kerjat == 3) {
            pk[1] = 2;
            naikPangkat(12);
        }
        if (kerjab == 2 && kerjat == 3) {
            naikPangkat(13);
        }
        if (kerjab == 13 && kerjat == 3) {
            pk[2] = 1;
            naikPangkat(14);
        }
        if (kerjab == 15 && kerjat == 3) {
            pk[3] = 1;
            naikPangkat(16);
        }
        if (kerjab == 17 && kerjat == 3) {
            pk[4] = 1;
            naikPangkat(18);
        }
    }

    function naikPangkat(a) {
        kerjab = a;
        kerjat = 0;
        gajib = Math.floor(Math.random() * 0.3 * gmin[kerjab]) + gmin[kerjab];
        alert("Kamu naik pangkat menjadi " + kerjad[kerjab] + ". Gaji kamu sekarang " + gajib + ".");
        updatea(20, 0, 0, 0);
    }

    function pecat(a) {
        if (bekerja == true) {
            alert("Kamu dipecat dari pekerjaan sebagai " + kerjad[kerjab] + ". Alasan: " + a);
            bekerja = false;
            kerjat = 0;
            gajib = 0;
            status = "Tidak bekerja";
            updatea(-100, 0, 0, 0);
        }
    }

    function tolak(a) {
        alert("Maaf. Kamu tidak bisa.");
        updatea(a, 0, 0, 0);
    }

    function gym() {
        if (health >= 10) {
            if (umur < 18) {
                if (gyma == false) {
                    updatea(4, 4, 0, 0);
                    gyma = true;
                }
            } else {
                if (uang >= 150000 && gyma == false) {
                    updatea(4, 4, 0, 0);
                    gyma = true;
                }
                uanga(150000);
            }
        } else {
            alert("Kamu tidak bisa ikut gym karena kamu terlalu lemah.");
        }
        update();
    }

    // function lib() {
    //     if(liba==false) {
    //         liba=true;
    //         happiness+=4;
    //         smarts+=4;
    //     }
    //     back();
    //     newLine("I went to library.");
    // }

    $("#perpus").click(function () {
        if (per == false) {
            per = true;
            updatea(0, 0, 3, 0);
        }
        back();
        newLine("Saya pergi ke perpustakaan.");
        update();
    });

    function sosmed() {
        if (sosjoin == false) {
            if (confirm("Gabung sosial media?")) {
                sosjoin = true;
            }
        } else {
            sosa = prompt("Sosial Media\nFollower: " + follower + "\nAktif: " + sosmeda + " tahun\nPost: " + spost + "\n1 = Post\n2 = Hapus");
            switch (sosa) {
                case "1":
                    spost++;
                    if (sosp == false) {
                        sosp = true;
                        updatea(3, 0, 0, 0);
                        if (follower == 0) {
                            follower += Math.floor(Math.random() * 6);
                        } else {
                            followa = Math.random() * 0.05 + 1.01; follower = Math.floor(follower * followa);
                        }
                    }
                    break;
                case "2":
                    sosjoin = false;
                    sosmeda = 0;
                    follower = 0;
                    spost = 0;
            }
        }
        update();
    }

    function sima() {
        if (umur >= 17) {
            if (sim == false) {
                if (simb == false) {
                    if (smarts >= 50) {
                        alert("Kamu sudah mendapatkan SIM!");
                        sim = true;
                        simu = 0;
                        updatea(10, 0, 0, 0);
                    } else {
                        simb = true;
                        tolak(-10);
                    }
                } else {
                    uanga(75000);
                    if (uang >= 75000) {
                        if (smarts < 50) {
                            r = Math.random();
                            if (r > 0.5) {
                                alert("Kamu sudah mendapatkan SIM!");
                                sim = true;
                                simu = 0;
                                updatea(10, 0, 0, 0);
                            } else {
                                tolak(0);
                            }
                        } else {
                            alert("Kamu sudah mendapatkan SIM!");
                            sim = true;
                            simu = 0;
                            updatea(10, 0, 0, 0);
                        }
                    }
                }
            } else {
                alert("Kamu sudah mendapatkan SIM! Tahun terlisensi: " + simu);
            }
            update();
        }
    }

    function kecanduan(a) {
        if (kec[a] != true) {
            kec[a] = true;
            switch (a) {
                case 0:
                    alert("Kamu sudah kecanduan Heroin!");
                    break;
                case 1:
                    alert("Kamu sudah kecanduan Ganja!");
                    break;
                case 2:
                    alert("Kamu sudah kecanduan Opium!");
                    break;
                case 3:
                    alert("Kamu sudah kecanduan LSD!");
                    break;
                case 4:
                    alert("Kamu sudah kecanduan MDMA!");
                    break;
                case 5:
                    alert("Kamu sudah kecanduan Morfin!");
            }
            updatea(-10, 0, 0, 0);
        }
    }

    function mobil() {
        if (umur >= 18) {
            if (sim == true) {
                mobilpp();
            } else {
                alert("Kamu harus mendapatkan SIM dulu!");
            }
            /* mobila=prompt("Mobil\nHarga: Rp"+Math.floor(mobilh)+"\nCicilan: Rp"+Math.floor(mobill)+"\nUmur: "+mobilu+" tahun\nKondisi: "+mobilk+"%\n1 = Lunas\n2 = Jual\n3 = Perbaiki");
            switch(mobila) {
                case "1":
                if(mobill>0) {
                    if(uang>=mobill) {
                        uang-=mobill;
                        mobill=0;
                        alert("Mobilmu sudah lunas!");
                    } else {
                        alert("Uang kamu tidak mencukupi!");
                    }
                } else {
                    alert("Mobilmu sudah lunas!");
                }
                break;
                case "2":
                r=Math.random();
                if(mobilk>=90 && r<0.7) {
                    jualMobil();
                } else if(r<0.4) {
                    jualMobil();
                } else {
                    alert("Tidak ada yang mau beli mobilmu.");
                }
            } */
            update();
        }
    }

    function mobilpp() {
        $("#game").hide();
        $("#mobilp").show();
    }

    function beliMobil() {
        $("#mobilp").hide();
        $("#mobila").show();
        if (mobilt == false) {
            mobilt = true;
            for (i = 0; i < 8; i++) {
                mobilhh[0] = Math.random() * 5000000000 + 5000000000;
                mobilhh[1] = Math.random() * 3000000000 + 2000000000;
                mobilhh[2] = Math.random() * 1000000000 + 1000000000;
                mobilhh[3] = Math.random() * 500000000 + 500000000;
                mobilhh[4] = Math.random() * 200000000 + 300000000;
                mobilhh[5] = Math.random() * 200000000 + 100000000;
                mobilhh[6] = Math.random() * 150000000 + 50000000;
                mobilhh[7] = Math.random() * 70000000 + 30000000;
                if (mobilhh[i] < 100000000) {
                    mobiluu[i] = rand(16) + 5;
                } else if (mobilhh[i] < 300000000) {
                    mobiluu[i] = rand(6);
                } else if (mobilhh[i] < 500000000) {
                    mobiluu[i] = rand(4);
                } else {
                    mobiluu[i] = 0;
                }
                if (mobiluu[i] == 0) {
                    mobilkk[i] = 100;
                } else if (mobiluu[i] <= 2) {
                    mobilkk[i] = rand(5) + 95;
                } else if (mobiluu[i] <= 5) {
                    mobilkk[i] = rand(7) + 90;
                } else if (mobiluu[i] <= 10) {
                    mobilkk[i] = rand(11) + 80;
                } else if (mobiluu[i] <= 15) {
                    mobilkk[i] = rand(21) + 70;
                } else {
                    mobilkk[i] = rand(26) + 50;
                }
                mobilm = document.createElement("div");
                mobilm.attr("class", "menuc");
                mobilm.html('<p><b id="mobil' + i + '"></b></p><p id="mobilh' + i + '"></p><button onclick="mobilc(' + i + ')" class="tmbl-aktif">Cicilan</button><button onclick="mobiln(' + i + ')" class="tmbl-aktif">Lunas</button>');
                if (mobilmm == false) {
                    $("#mobila").appendChild(mobilm);
                }
                $("#mobil" + i).html("Mobil");
                $("#mobilh" + i).html("Harga: Rp" + Math.floor(mobilhh[i]) + "<br>Umur: " + mobiluu[i] + " tahun<br>Kondisi: " + mobilkk[i] + "%");
                if (i == 7) {
                    mobilmm = true;
                }
            }
        }
        update();
    }

    function mobilc(a) {
        if (status == "Bekerja" || status == "Pensiun") {
            mobilh.push(mobilhh[a]);
            mobild = mobilh;
            if (uang >= mobild / 5) {
                mobill = mobild;
                mobill -= mobild / 5;
                mobilu.push(mobiluu[a]);
                mobilk.push(mobilkk[a]);
                //mobilh=mobilh*0.8;
                mobilm = document.createElement("div");
                mobilm.attr("class", "menuc");
                mobilm.html('<p><b>Mobil</b></p><p id="mobilhh' + mj + '"></p><button onclick="" class="tmbl-hub">Lunas</button><button onclick="" class="tmbl-hub">Jual</button>');
                $("#mobilp").appendChild(mobilm);
                $("#mobilhh" + mj).html("Harga: Rp" + Math.floor(mobilh[mj]) + "<br>Cicilan: Rp" + Math.floor(mobill) + "<br>Umur: " + mobilu[mj] + " tahun<br>Kondisi: " + mobilk[mj] + "%");
                mj++;
                asset();
            }
            uanga(mobild / 5);
        } else {
            alert("Kamu harus punya pekerjaan!");
        }
        update();
    }

    function mobiln(a) {
        if (uang >= mobilhh[a]) {
            mobilp = true;
            mobilh = mobilhh[a];
            mobilu = mobiluu[a];
            mobilk = mobilkk[a];
            mobilh = mobilh * 0.8;
            asset();
        }
        uanga(mobilhh[a]);
        update();
    }

    function jualMobil() {
        alert("Mobilmu terjual!")
        uang += mobilh - mobill;
        mobilp = false;
        mobill = 0;
    }

    function rumah() {
        if (umur >= 18) {
            if (rumahp == false) {
                $("#game").hide();
                $("#rumaha").show();
                beliRumah();
            } else {
                rumaha = prompt("Beli rumah\n" + br + "br/" + ba + "ba\nHarga: Rp" + Math.floor(rumahh) + "\nCicilan: Rp" + Math.floor(rumahl) + "\nUmur: " + rumahu + " tahun\nKondisi: " + rumahk + "%\n1 = Lunas\n2 = Jual\n3 = Renovasi");
                switch (rumaha) {
                    case "1":
                        if (rumahl > 0) {
                            if (uang >= rumahl) {
                                uang -= rumahl;
                                rumahl = 0;
                                alert("Rumahmu sudah lunas!");
                            } else {
                                alert("Uang kamu tidak mencukupi!");
                            }
                        } else {
                            alert("Rumahmu sudah lunas!");
                        }
                        break;
                    case "2":
                        r = Math.random();
                        if (rumahk >= 90 && rumahu <= 5) {
                            jualRumah();
                        } else if (rumahk >= 70 && rumahu <= 30 && r < 0.7) {
                            jualRumah();
                        } else if (rumahk >= 50 && r < 0.5) {
                            jualRumah();
                        } else if (rumahk >= 30 && r < 0.3) {
                            jualRumah();
                        } else if (rumahk >= 10 && r < 0.2) {
                            jualRumah();
                        } else if (r < 0.1) {
                            jualRumah();
                        } else {
                            alert("Tidak ada yang mau beli rumahmu.");
                        }
                        break;
                    case "3":
                        renovh = [Math.floor(rumahh * 0.01), Math.floor(rumahh * 0.02), Math.floor(rumahh * 0.05), Math.floor(rumahh * 0.1), Math.floor(rumahh * 0.2)];
                        renov = prompt("Pilih budget:\n1 = Rp" + renovh[0] + "\n2 = Rp" + renovh[1] + "\n3 = Rp" + renovh[2] + "\n4 = Rp" + renovh[3] + "\n5 = Rp" + renovh[4]);
                        switch (renov) {
                            case "1":
                                renovasi(0);
                                break;
                            case "2":
                                renovasi(1);
                                break;
                            case "3":
                                renovasi(2);
                                break;
                            case "4":
                                renovasi(3);
                                break;
                            case "5":
                                renovasi(4);
                        }
                }
            }
        }
        update();
    }

    function beliRumah() {
        if (rumaht == false) {
            rumaht = true;
            for (i = 0; i < 8; i++) {
                rumahhh[0] = Math.random() * 70000000000 + 30000000000;
                rumahhh[1] = Math.random() * 40000000000 + 10000000000;
                rumahhh[2] = Math.random() * 15000000000 + 5000000000;
                rumahhh[3] = Math.random() * 7000000000 + 3000000000;
                rumahhh[4] = Math.random() * 4000000000 + 1000000000;
                rumahhh[5] = Math.random() * 1500000000 + 500000000;
                rumahhh[6] = Math.random() * 400000000 + 100000000;
                rumahhh[7] = Math.random() * 150000000 + 50000000;
                if (rumahhh[i] < 200000000) {
                    rumahuu[i] = rand(51) + 20;
                    rbr[i] = 1;
                    rba[i] = 1;
                } else if (rumahhh[i] < 400000000) {
                    rumahuu[i] = rand(36) + 15;
                    rbr[i] = rand(2) + 1;
                    rba[i] = rand(2) + 1;
                } else if (rumahhh[i] < 2000000000) {
                    rumahuu[i] = rand(31);
                    rbr[i] = rand(3) + 2;
                    rba[i] = rand(3) + 2;
                } else if (rumahhh[i] < 5000000000) {
                    rumahuu[i] = rand(16);
                    rbr[i] = rand(4) + 2;
                    rba[i] = rand(4) + 2;
                } else if (rumahhh[i] < 10000000000) {
                    rumahuu[i] = rand(6);
                    rbr[i] = rand(5) + 3;
                    rba[i] = rand(5) + 3;
                } else {
                    rumahuu[i] = rand(4);
                    rbr[i] = rand(7) + 4;
                    rba[i] = rand(7) + 4;
                }
                if (rumahuu[i] <= 2) {
                    rumahkk[i] = 100;
                } else if (rumahuu[i] <= 10) {
                    rumahkk[i] = rand(11) + 90;
                } else if (rumahuu[i] <= 20) {
                    rumahkk[i] = rand(21) + 80;
                } else if (rumahuu[i] <= 30) {
                    rumahkk[i] = rand(31) + 70;
                } else if (rumahuu[i] <= 50) {
                    rumahkk[i] = rand(51) + 50;
                } else {
                    rumahkk[i] = rand(81) + 20;
                }
                rumahm = document.createElement("div");
                rumahm.attr("class", "menuc");
                rumahm.html('<p><b id="rumah' + i + '"></b></p><p id="rumahh' + i + '"></p><button onclick="rumahc(' + i + ')" class="tmbl-aktif">Cicilan</button><button onclick="rumahn(' + i + ')" class="tmbl-aktif">Lunas</button>');
                if (rumahmm == false) {
                    $("#rumaha").appendChild(rumahm);
                } $("#rumah" + i).html("Rumah (" + rbr[i] + "br/" + rba[i] + "ba)");
                $("#rumahh" + i).html("Harga: Rp" + Math.floor(rumahhh[i]) + "<br>Umur: " + rumahuu[i] + " tahun<br>Kondisi: " + rumahkk[i] + "%");
                if (i == 7) {
                    rumahmm = true;
                }
            }
        }
        update();
    }

    function rumahc(a) {
        if (status == "Bekerja" || status == "Pensiun") {
            rumahh = rumahhh[a];
            rumahd = rumahh;
            if (uang >= rumahd / 5) {
                rumahl = rumahd;
                rumahl -= rumahd / 5;
                rumahu = rumahuu[a];
                rumahk = rumahkk[a];
                br = rbr[a];
                ba = rba[a];
                rumahp = true;
                asset();
            }
            uanga(rumahd / 5);
        } else {
            alert("Kamu harus punya pekerjaan!");
        }
        update();
    }

    function rumahn(a) {
        if (uang >= rumahhh[a]) {
            rumahp = true;
            rumahh = rumahhh[a];
            rumahu = rumahuu[a];
            rumahk = rumahkk[a];
            br = rbr[a];
            ba = rba[a];
            asset();
        }
        uanga(rumahhh[a]);
        update();
    }

    function jualRumah() {
        alert("Rumahmu terjual!");
        uang += rumahh - rumahl;
        rumahp = false;
        rumahl = 0;
    }

    function renovasi(a) {
        if (uang >= renovh[a]) {
            switch (a) {
                case 0:
                    if (rumahk < 100) {
                        rumahh = rumahh * 1.01;
                    }
                    rumahk += 2;
                    break;
                case 1:
                    if (rumahk <= 96) {
                        rumahh = rumahh * 1.02;
                    }
                    rumahk += 4;
                    break;
                case 2:
                    if (rumahk <= 91) {
                        rumahh = rumahh * 1.05;
                    }
                    rumahk += 10;
                case 3:
                    if (rumahk <= 83) {
                        rumahh = rumahh * 1.1;
                    } else if (rumahk <= 91) {
                        rumahh = rumahh * 1.05;
                    }
                    rumahk += 20;
                    break;
                case 4:
                    if (rumahk <= 66) {
                        rumahh = rumahh * 1.2;
                    } else if (rumahk <= 83) {
                        rumahh = rumahh * 1.1;
                    } else if (rumahk <= 91) {
                        rumahh = rumahh * 1.05;
                    }
                    rumahk += 40;
            }
        }
        uanga(renovh[a]);
        if (rumahk > 100) {
            rumahk = 100;
        }
    }

    function meninggal() {
        if (died == false) {
            died = true;
            alert("Kamu sudah meninggal dunia!");
            document.write("Nama kamu " + nama + ". Kamu adalah " + gd + ". Kamu lahir tanggal " + day + " " + month[mon - 1] + " " + year + ". Umur kamu " + umur + " tahun.");
        }
    }

    //KASIH GOJEK YANG BANYAK 2K20

    // function newLine(a) {
    //     $("#messages").append(a+"<br>");
    //     update();
    // }

    // function notEnough() {
    //     swal.fire({
    //         title: "Ups...",
    //         text:"Uang kamu tidak mencukupi!",
    //         icon:"error"
    //     });
    // }

    // function randomEvents() {
    //     r=Math.random();
    //     if(place==0||place==17||place==26||place==36) {
    //         if(r<0.01) {
    //             die(3);
    //         }
    //     }
    //     if(died==false) {
    //     if(age<18) {
    //         if(r<0.3) {
    //         if(age>6&&o!=4) {
    //         r=Math.random();
    //         let blfn, blln;
    //         if(r<0.5) {
    //         blfn=getMaleFN();
    //         } else {
    //         blfn=getFemaleFN();
    //         }
    //         blln=getLN();
    //         swal("School","You're get bullied by "+blfn+" "+blln,{buttons:{
    //             cancel:"Do nothing",
    //             assault: "Assault",
    //             report: "Report to the headmaster"
    //             }
    //         }).then((value)=>{
    //         newLine("I got bullied by "+blfn+" "+blln+".");
    //         switch(value) {
    //             case "assault":
    //             newLine("I assaulted "+blfn+" "+blln+"!");
    //             break;
    //             case "report":
    //             newLine("I reported "+blfn+" "+blln+" to the headmaster.");
    //         }
    //         });
    //         }
    //         }
    //     } else {
    //         if(r<0.001) {
    //             swal("Victim","You're struck by lightning!");
    //             r=Math.random();
    //             if(r<0.5) {
    //                 happiness=100;
    //                 health=100;
    //                 smarts=100;
    //                 looks=100;
    //             } else {
    //                 die(4);
    //                 happiness=0;
    //                 health=0;
    //                 smarts=0;
    //                 looks=0;
    //             }
    //             newLine("I was struck by lightning!");

    //         } else if(r<0.05) {
    //             let drugo=rand(0,drugs.length);
    //             swal("Drug","You're offered "+drugs[drugo],{buttons:true,dangerMode:true}).then((drug)=>{
    //                 if(drug) {
    //                     switch(drugo) {
    //                         case 0:
    //                         case 1:
    //                         case 3:
    //                         case 4:
    //                         case 5:
    //                         drugt=true;
    //                         health-=50;
    //                         if(health<0) {
    //                             die(5);
    //                         }
    //                         break;
    //                         case 2:
    //                         drugt=true;
    //                         happiness+=16;
    //                         health-=16;
    //                     }
    //                     newLine("I started trying "+drugs[drugo]+".");
    //                 } else {
    //                     newLine("I said no to "+drugs[drugo]+".");
    //                 }
    //             });
    //         } else if(r<0.1) {
    //             swal("Encounter","You encountered a ","warning",{buttons:{
    //                 cancel:"Run for my life!",
    //                 retreat:"Retreat slowly",
    //                 pet:"Pet it"
    //             }}).then((value)=>{switch(value) {
    //                 case "retreat":
    //                 newLine("I encountered a . I retreated slowly.");
    //                 break;
    //                 case "pet":
    //                 newLine("I encountered a . I pet it.");
    //                 break;
    //                 default:
    //                 newLine("I encountered a . I evaded it.");
    //             }});
    //         }
    //     }
    //     }
    // }

    // function update() {
    //     if(happiness>100) {
    //         happiness=100;
    //     }
    //     if(happiness<0) {
    //         happiness=0;
    //     }
    //     if(health>100) {
    //         health=100;
    //     }
    //     if(health<0) {
    //         health=0;
    //     }
    //     if(smarts>100) {
    //         smarts=100;
    //     }
    //     if(smarts<0) {
    //         smarts=0;
    //     }
    //     if(looks>100) {
    //         looks=100;
    //     }
    //     if(looks<0) {
    //         looks=0;
    //     }
    //     $("#topPart").html("AmpuLife | Rp"+uang);
    //     document.getElementById("messages").scrollBy(0,1000000);
    //     $("#happiness").val(happiness);
    //     $("#health").val(health);
    //     $("#smarts").val(smarts);
    //     $("#looks").val(looks);
    // }


    // $("#ageUp").click(function() {
    //     umur++;
    //     otherEvents=false;
    //     gyma=false;
    //     liba=false;
    //     medt=false;
    //     drugt=false;
    //     ageForMessage = "<span class='blue'> Umur: " + age + " tahun</span>";
    //     newLine("<br><br>" + ageForMessage);
    //     happiness+=rand(-2,5);
    //     health+=rand(-2,5);
    //     smarts+=rand(-2,5);
    //     if(age<18) {
    //         looks+=rand(-2,5);
    //     } else if(age<40) {
    //         looks+=rand(-1,5);
    //     } else if(age<60) {
    //         looks+=rand(-2,4);
    //     } else {
    //         looks+=rand(-3,5);
    //     }
    //     if(o==3) {
    //         sman++;
    //     }
    //     if(o==7) {
    //         un++;
    //     }
    //     if(age>=60) {
    //         r=Math.random();
    //         if(age<70) {
    //             if(r<0.03) {
    //                 die(rand(0,3));
    //             }
    //         } else if(age<80) {
    //             if(r<0.05) {
    //                 die(rand(0,3));
    //             }
    //         } else if(age<90) {
    //             if(r<0.1) {
    //                 die(rand(0,3));
    //             }
    //         } else {
    //             if(r<0.2) {
    //                 die(rand(0,3));
    //             }
    //         }
    //     }
    //     if(age>=12) {
    //         $("#mind").show();
    //     }
    //     if(age>=18) {
    //         $("#gym").text("Gym (Rp300.000)");
    //     }
    //     if(died==false) {
    //         for(i=0;i<rl.length;i++) {
    //             if(rl[i]==true) {
    //                 rlage[i]++;
    //                 r=Math.random();
    //                 if(rlage[i]<60) {
    //                     if(r<0.01) {
    //                         rlDie(i);
    //                     }
    //                 } else if(rlage[i]<70) {
    //                     if(r<0.03) {
    //                         rlDie(i);
    //                     }
    //                 } else if(rlage[i]<80) {
    //                     if(r<0.05) {
    //                         rlDie(i);
    //                     }
    //                 } else if(rlage[i]<90) {
    //                     if(r<0.1) {
    //                         rlDie(i);
    //                     }
    //                 } else {
    //                     if(r<0.2) {
    //                         rlDie(i);
    //                     }
    //                 }
    //             }
    //         }
    //         if(umur=6) {
    //             sd=rand(1,200);
    //             o=1;
    //             swal.fire({
    //                 title:"Sekolah",
    //                 text:"Kamu bersekolah di SDN "+sd,
    //                 icon:"info"});
    //             newLine("Kamu bersekolah di SDN "+sd+".");
    //         } else if(umur=12) {
    //             smp=rand(1,150);
    //             o=2;
    //             swal.fire({
    //                 title:"Sekolah",
    //                 text:"Kamu bersekolah di SMPN "+smp+" "+kota,
    //                 icon:"info"});
    //             newLine("Kamu bersekolah di SMPN "+smp+" "+kota+".");
    //         } else if(umur=15) {
    //             sma=rand(1,100);
    //             o=3;
    //             swal.fire({
    //                 title:"Sekolah",
    //                 text:"Kamu bersekolah di SMAN "+sma,
    //                 icon:"info"});
    //             newLine("Kamu bersekolah di SMAN "+sma+".");
    //         } else if(o==3&&sman==3) {
    //             learn++;
    //             o=4;
    //             swal.fire("Sekolah","You're graduated from SMAN "+sma,"success",{buttons:{
    //                 cancel:"Take some time off",
    //                 univ:"Go to university",
    //                 jobs:"Browse jobs"
    //             }}).then((value)=>{
    //                 newLine("I graduated from SMAN "+sma+".");
    //                 switch(value) {
    //                     case "univ":
    //                     univ();
    //                     newLine("I go to university.");
    //                     break;
    //                     case "jobs":
    //                     newLine("I decieded to browse some jobs.");
    //                     break;
    //                     default:
    //                     newLine("I decided to take some time off.");
    //                 }
    //             });
    //         } else if(o==7&&un==4) {
    //             learn++;
    //             o=4;
    //             swal("University","You're graduated from university.","success");
    //             newLine("I graduated from university.");
    //         } else if(otherEvents==false) {
    //             randomEvents();
    //         }
    //     }
    //     update();
    // });

    // function univ() {
    // if(smarts>=25) {
    //     swal("University","Pick a major:",{buttons:{
    //         art:"Arts",
    //         bi:"Biology",
    //         ch:"Chemistry",
    //         com:"Computer Science",
    //         fi:"Finance"
    //     }}).then((value)=>{
    //     switch(value) {
    //         case "art":
    //         um=0;
    //         break;
    //         case "bi":
    //         um=1;
    //         break;
    //         case "ch":
    //         um=2;
    //         break;
    //         case "com":
    //         um=3;
    //         break;
    //         case "fi":
    //         um=4;
    //         break;
    //         default:
    //         um=-1;
    //     }
    //     if(um!=-1) {
    //     swal("University","You are majoring "+major[um]+"\nCost: $45000",{buttons:{
    //         sch:"Apply for scholarship",
    //         loan:"Apply for student loan"
    //     }}).then((pay)=>{
    //         switch(pay) {
    //             case "sch":
    //             if(smarts>=90) {
    //                 univer();
    //             } else {
    //                 swal("University","Your application scholarship was rejected.","error");
    //             }
    //             break;
    //             case "loan":
    //             univer();
    //         }
    //     });
    //     }
    //     });
    // } else {
    //     swal("University","You are rejected from university.","error");
    // }
    // }

    // function univer() {
    //     o=7;
    //     newLine("I started university.");
    // }

    // function occupation() {
    //     if(o==0) {
    //         swal("Occupation","You're infant.");
    //     }
    //     if(o==1) {
    //         swal("Occupation","You're schooling in SDN "+sd+".",{buttons:["Back","Drop Out"],dangerMode:true}).then((dropOut)=>{
    //             if(dropOut) {
    //                 swal("School","Your parents won't let you drop out from school.","error");
    //             }
    //         });
    //     }
    //     if(o==2) {
    //         swal("Occupation","You're schooling in SMPN "+smp+".",{buttons:["Back","Drop Out"],dangerMode:true}).then((dropOut)=>{
    //             if(dropOut) {
    //                 swal("School","Your parents won't let you drop out from school.","error");
    //             }
    //         })
    //     }
    //     if(o==3) {
    //         swal("Occupation","You're schooling in SMAN "+sma+".",{buttons:["Back","Drop Out"],dangerMode:true}).then((dropOut)=>{
    //             if(dropOut) {
    //                 o=4;
    //                 swal("School","You're dropped out from school.");
    //                 newLine("I dropped out from school.");
    //             }
    //         });
    //     }
    //     if(o==4) {
    //         if(learn==0) {
    //         swal("Occupation","You are unemployeed.",{buttons:{
    //             cancel:"Back",
    //             ged:"GED ($1000)",
    //             jobs:"Browse jobs"
    //         }}).then((value)=>{
    //             switch(value) {
    //                 case "ged":
    //                 if(uang>=1000) {
    //                     uang-=1000;
    //                     learn++;
    //                     swal("You passed the GED exam!",{icon:"success"});
    //                     newLine("I passed the GED exam!");
    //                 } else {
    //                     notEnough();
    //                 }
    //                 break;
    //                 case "jobs":
    //                 jobs();
    //             }
    //         });
    //         } else if(learn==1) {
    //             swal("Occupation","You are unemployeed.",{buttons:{
    //             cancel:"Back",
    //             univ:"University",
    //             jobs:"Browse jobs"
    //         }}).then((value)=>{
    //             switch(value) {
    //                 case "univ":
    //                 univ();
    //                 break;
    //                 case "jobs":
    //                 jobs();
    //             }
    //         });
    //         } else {
    //             swal("Occupation","You are unemployeed.",{buttons:{
    //             cancel:"Back",
    //             jobs:"Browse jobs"
    //         }}).then((value)=>{
    //             switch(value) {
    //                 case "jobs":
    //                 jobs();
    //             }
    //         });
    //         }
    //     }
    //     if(o==7) {
    //         swal("Occupation","You are in university.\nMajor: "+major[um],{buttons:["Back","Drop Out"],dangerMode:true}).then((dropOut)=>{
    //             if(dropOut) {
    //                 o=4;
    //                 un=0;
    //                 swal("University","You're dropped out from university.");
    //                 newLine("I dropped out from university.");
    //             }
    //         });
    //     }
    // }

    // function back() {
    //     $("#assets").css("display","none");
    //     $("#activities").css("display","none");
    //     $("#jobs").css("display","none");
    //     $("#messages").css("display","block");
    //     $("#btn-back").css("display","none");
    //     $("#groups").css("display","block");
    //     $("#ageUp").css("display","block");
    // }

    // function hideGroups(a) {
    //     $("#groups").css("display","none");
    //     $("#ageUp").css("display","none");
    //     if(a==true) {
    //     $("#btn-back").css("display","block");
    //     }
    // }

    // function assets() {
    //     $("#messages").css("display","none");
    //     $("#assets").css("display","block");
    //     hideGroups(true);
    // }

    // function activities() {
    //     $("#messages").css("display","none");
    //     $("#activities").css("display","block");
    //     hideGroups(true);
    // }

    // function jobs() {
    //     $("#messages").css("display","none");
    //     $("#jobs").css("display","block");
    //     hideGroups(true);
    // }

    // function gym() {
    //     if(age<18) {
    //     if(gyma==false) {
    //         gyma=true;
    //         happiness+=8;
    //         health+=8;
    //     }
    //     back();
    //     newLine("I went to gym.");
    //     } else {
    //         if(uang>=20) {
    //         uang-=20;
    //             if(gyma==false) {
    //         gyma=true;
    //         happiness+=8;
    //         health+=8;
    //     }
    //     back();
    //     newLine("I went to gym.");
    //         } else {
    //             notEnough();
    //         }
    //     }
    // }



    // function med() {
    //     if(medt==false) {
    //         medt=true;
    //         happiness+=4;
    //         health+=4;
    //     }
    //     back();
    //     newLine("I meditated.");
    // }

    // function rlDie(a) {
    //     otherEvents=true;
    //     rl[a]=false;
    //     let rla=["mother","father"];
    //     let rlc;
    //     if(rlage[a]<60) {
    //     if(place==0||place==17||place==26||place==36) {
    //         rlc=3;
    //     } else {
    //         r=Math.random();
    //         if(r<0.1) {
    //             rlc=4;
    //         } else {
    //             rlc=5;
    //         }
    //     }
    //     } else {
    //         rlc=rand(0,3);
    //     }
    //     happiness=4;
    //     swal("Death","Your "+rla[a]+", "+rlname[a]+" "+dieCauses[rlc]+".",{buttons:["Attend the funeral","Skip the funeral"],dangerMode:true}).then((skip)=>{
    //         newLine("My "+rla[a]+" "+dieCauses[rlc]+".");
    //         if(skip) {
    //             newLine("I couldn't bother the funeral.");
    //         } else {
    //             newLine("I attended the funeral.");
    //         }
    //     });
    // }

    // function die(a) {
    //     died=true;
    //     swal("Death","You "+dieCauses[a]+".");
    //     $("#messages").css("display","none");
    //     $("#result").css("display","block");
    //     hideGroups(false);
    //     $("#journal").css("display","block");
    //     $("#result").append("<br><span class='blue'>You "+dieCauses[a]+"<br><br></span>");
    //     $("#result").append("Name: "+fname+" "+names+"<br>");
    //     $("#result").append("Age: "+umur+" years<br>");
    // }

    // function journal() {
    //     $("#result").css("display","none");
    //     $("#messages").css("display","block");
    //     $("#journal").css("display","none");
    //     update();
    // }

    // newLine("<br>" + ageForMessage + "Perkenalkan nama saya " + namaLengkap + ". Saya terlahir sebagai " + genders + ". Saya lahir di " + placeBorn + ", Indonesia pada tanggal.");

    // newLine("<br>" + "Saya lahir di "+ kota + ", Indonesia pada tanggal " + dayBorn + " "+ month + ".");

    // newLine("My name is "+fname+" " + names + ".");
    // newLine("Bapak saya "+rlname[0]+". (Umur "+rlage[0]+")");
    // newLine("Ibu saya "+rlname[1]+". (Umur "+rlage[1]+")")

    // $("#happiness").val(happiness);
    // $("#health").val(health);
    // $("#smarts").val(smarts);
    // $("#looks").val(looks);


})