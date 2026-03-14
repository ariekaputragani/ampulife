$(function(){

    $("#menu-lahir").hide();

    $("#menu-1").click(function() {
        $("#main-menu").hide();
        $("#menu-lahir").show();
    });

    $("#menu-2").click(function() {
        swal.fire({
            icon: 'info',
            title: 'Info Pengembang',
            html: 'By Ari Eka Putragani<br><br>'+
            'Dosen Pembimbing:<br>'+
            'Dani Arifudin, M.Kom.<br>'+
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

    function rand(a) {
        let num=Math.floor(Math.random()*a);
        return num;
    }

    // function valid(a,b) {
    // switch(b) {
    //     case 0:
    //     if(a>31) {
    //         return 31;
    //     } else if(a<0) {
    //         return 1;
    //     } else {
    //         return a;
    //     }
    //     break;
    //     case 1:
    //     if(a>12) {
    //         return 12;
    //     } else if(a<0){
    //         return 1;
    //     } else {
    //         return a;
    //     }
    //     break;
    //     case 2:
    //     if(a>2026) {
    //         return 2026;
    //     } else if(a<0) {
    //         return 1990;
    //     } else{
    //         return a;
    //     }
    // }
    // }

    // function cv() {
    //    day=valid($("#day").val(),0);
    //     mon=valid($("#month").val(),1);
    //     year=valid($("#year").val(),2);
    //    $("#day").val()=day;
    //     $("#month").val()=mon;
    //     $("#year").val()=year;
    // }

    function validMonth(a,d,y) {
        switch(a) {
            case "Januari":
                $("#29").css("display","block !important");
                $("#30").css("display","block !important");
                $("#31").css("display","block !important");
                return 1;
                break;
            case "Februari":
                if(y%4==0) {
                    $("#29").css("display","block !important");
                } else {
                    $("#29").css("display","none !important");
                }
                $("#30").css("display","none !important");
                $("#31").css("display","none !important");
                return 2;
                break;
            case "Maret":
                $("#29").css("display","block !important");
                $("#30").css("display","block !important");
                $("#31").css("display","block !important");
                return 3;
                break;
            case "April":
                $("#29").css("display","block !important");
                $("#30").css("display","block !important");
                $("#31").css("display","none !important");
                return 4;
                break;
            case "Mei":
                $("#29").css("display","block !important");
                $("#30").css("display","block !important");
                $("#31").css("display","block !important");
                return 5;
                break;
            case "Juni":
                $("#29").css("display","block !important");
                $("#30").css("display","block !important");
                $("#31").css("display","none !important");
                return 6;
                break;
            case "Juli":
                $("#29").css("display","block !important");
                $("#30").css("display","block !important");
                $("#31").css("display","block !important");
                return 7;
                break;
            case "Agustus":
                $("#29").css("display","block !important");
                $("#30").css("display","block !important");
                $("#31").css("display","block !important");
                return 8;
                break;
            case "September":
                $("#29").css("display","block !important");
                $("#30").css("display","block !important");
                $("#31").css("display","none !important");
                return 9;
                break;
            case "Oktober":
                $("#29").css("display","block !important");
                $("#30").css("display","block !important");
                $("#31").css("display","block !important");
                return 10;
                break;
            case "November":
                $("#29").css("display","block !important");
                $("#30").css("display","block !important");
                $("#31").css("display","none !important");
                return 11;
                break;
            case "Desember":
                $("#29").css("display","block !important");
                $("#30").css("display","block !important");
                $("#31").css("display","block !important");
                return 12;
        }
    }

    $("#month").change(function() {
        day=parseInt($("#day").val(),10);
        year=parseInt($("#year").val(),10);
        mon=validMonth($("#month").val(),day,year);
        // validMonth($("#month").val(),day,year);
    });

    $("#form-lahir").submit(function() {
        nama=$("#nama").val();
        gender=$("#jk").val();
        if(gender=="l")
            gd="laki-laki";
        else
            gd="perempuan";
        kota=$("#kota").val();
        day=parseInt($("#day").val(),10);
        // mon=$("#month").val();
        year=parseInt($("#year").val(),10);
        mon=validMonth($("#month").val(),year);
        yeara=year;
        if(year%4==0) {
            daya[1]=29;
        }

        if(nama!=""&&gender!=""&&kota!=""&&day>=1&&mon>=1&&year>=1990) {
            update();
            $("#menu-lahir").hide();
            $("#game").show();
            $("#menu").show();
            $("#hubn0").html(hubn[0]+" (Bapak)");
            $("#hubn1").html(hubn[1]+" (Ibu)");
        } else {
            swal.fire({icon:"error",
                title:"Oops...",
                text:"Masukkan data yang benar!"});
        }
    });

    function update() {
        for(i=0;i<peny.length;i++) {
            if(penh[i]<0) {
                penh[i]=0;
                isp[i]=false;
                alert("Kamu sembuh dari "+peny[i]+".");
                updatea(10,3,0,0);
            }
        }
    $("#birth").html("Nama saya "+nama+". Aku terlahir sebagai "+gd+". Saya lahir di "+kota+" pada tanggal " + day +" "+ month[mon-1] + " " + year + ".");
    $("#umur").html("Umur: " + umur + " tahun ("+yeara+")");
        $("#uang").html("Uang: Rp" + Math.floor(uang));
        $("#uangm").html("Uang: Rp" + Math.floor(uang));
        $("#uangr").html("Uang: Rp" + Math.floor(uang));
        
    $("#status").html("Status: " + status);

    $("#happy").css("width",happy+"%");

    $("#happy").html(happy+"%");

    if(happy<=15) {
        $("#happy").css("background","#ff0000");
    } else if(happy<=30) {
        $("#happy").css("background","#ffa500");
    } else {
        $("#happy").css("background","#00ff00");
    }

    $("#health").css("width",health+"%");

    $("#health").html(health+"%");

    if(health<=15) {
        $("#health").css("background","#ff0000");
    } else if(health<=30) {
        $("#health").css("background","#ffa500");
    } else {
        $("#health").css("background","#00ff00");
    }

    $("#smarts").css("width",smarts+"%");

    $("#smarts").html(smarts+"%");

    if(smarts<=15) {
        $("#smarts").css("background","#ff0000");
    } else if(smarts<=30) {
        $("#smarts").css("background","#ffa500");
    } else {
        $("#smarts").css("background","#00ff00");
    }

    $("#looks").css("width",looks+"%");

    $("#looks").html(looks+"%");

    if(looks<=15) {
        $("#looks").css("background","#ff0000");
    } else if(looks<=30) {
        $("#looks").css("background","#ffa500");
    } else {
        $("#looks").css("background","#00ff00");
    }

    if(status=="SD"||status=="SMP"||status=="SMA"||status=="Universitas") {
        $("#kerja").html("Berhenti sekolah");
        $("#kerja").attr("class","tmbl-aktif");
        $("#univ").attr("class","");
        
        } else if(status=="Tidak bekerja"||status=="Pensiun") {
        bekerja=false;
        $("#kerja").html("Kerja");
    if(umur>=18&&ua<4) { 
    $("#univ").attr("class","tmbl-aktif");
    }

    } else if(status=="Bekerja") {
    bekerja=true;
        $("#kerja").html("Berhenti bekerja");
        $("#univ").attr("class","");
    }

    switch(status) {
            case "SD":
            $("#statusa").html("Kamu bersekolah di SD.");
            break;
            case "SMP":
            $("#statusa").html("Kamu bersekolah di SMPN "+smp+" "+kota+".");
            break;
            case "SMA":
    $("#statusa").html("Kamu bersekolah di "+sman+" "+sma+" "+kota+".");
            break;
    case "Universitas":
    $("#statusa").html("Kamu kuliah di Universitas. Jurusan: "+uc[u]);
    break;
    case "Bekerja":
    $("#statusa").html("Kamu bekerja sebagai "+kerjad[kerjab]+". Gaji per bulan kamu sekarang Rp"+Math.floor(gajib)+".");
    break;
    case "Di penjara":
    $("#statusa").html("Kamu di penjara. Kamu akan bebas dalam "+pjt+" tahun lagi.");
    break;
    case "Tidak bekerja":
    case "Pensiun":
    $("#statusa").html("");
        }
    }

    function updatea(a, b, c, d) {
        happy += a;
        health += b;
        smarts += c;
        looks += d;
        if(happy > 100) {
            happy = 100;
        } else if(happy < 0) {
            happy = 0;
        }
        if(health > 100) {
            health = 100;
        } else if(health <= 0) {
            health = 0;
            meninggal();
        }
        if(smarts > 100) {
            smarts = 100;
        } else if(smarts < 0) {
            smarts = 0;
        }
        if(looks > 100) {
            looks = 100;
        } else if(looks < 0) {
            looks = 0;
        }
    }

    function updateb() {
    if(umur>=60) {
        if(umur < 65) {
        if(health < 10) {
            meninggal();
            }
        } else if(umur < 70) {
        if(health < 15) {
            meninggal();
            }
        } else if(umur < 75) {
        if(happy<10||health<20) {
            meninggal();
            }
        } else if(umur < 80) {
        if(happy<15||health<25) {
            meninggal();
            }
        } else if(umur < 85) {
        if(happy<30||health<35) {
            meninggal();
            }
        } else if(umur < 90) {
        if(happy<50||health<55) {
            meninggal();
            }
        } else if(umur < 95) {
        if(happy<70||health<80)
            meninggal();
        } else if(umur < 100) {
        if(happy<80||health<90) {
            meninggal();
            }
        } else {
        if(happy<90||health<96) {
            meninggal();
            }
        }
        }
    }

    function uanga(a) {
        if(uang >= a) {
            uang -= a;
        } else {
            alert("Uang kamu tidak mencukupi!");
        }
    }

    function tambahUmur() {
        umur++;
        yeara++;
        simu++;
        if(penjara==true) {
            pjt--;
            if(pjt==0) {
                bebasp();
            }
        }
        uang+=12*gajib;
        gyma=false;
        per=false;
        sosp=false;
        kerjac=false;
        mobilt=false;
        rumaht=false;
        pjk=false;
        for(i=0;i<2;i++) {
            hubma[i]=false;
            hubim[i]=false;
            hubiw[i]=false;
            hubmi[i]=false;
            if(hub[i]==true) {
                hubu[i]++;
                hubr[i]+=rand(4)-2;
                if(hubr[i]>100) {
                    hubr[i]=100;
                } else if(hubr[i]<0) {
                    hubr[i]=0;
                }
            }
            r=Math.random();
            if(hubu[i]<60) {
            if(r<0.01) {
                hubmen(i);
                }
            } else if(hubu[i]<70) {
            if(r<0.05) {
                hubmen(i);
                }
            } else if(hubu[i]<80) {
            if(r<0.1) {
                hubmen(i);
                }
            } else if(r<0.2) {
                hubmen(i);
            }
        }
        if(isp[0]==true) {
            updatea(0,-15,0,0);
            penh[0]-=20;
        }
        if(isp[1]==true) {
            updatea(0,-15,0,0);
            penh[1]-=20;
        }
        if(isp[2]==true) {
            updatea(0,-15,0,0);
            penh[2]-=20;
        }
        if(isp[3]==true) {
            if(umur<6) {
                updatea(0,-35,0,0);
            } else if(umur<12) {
                updatea(0,-10,0,0);
            } else if(umur<18) {
                updatea(0,-5,0,0);
            } else {
                updatea(0,-1,0,0);
            }
            penh[3]+=50;
        }
        if(isp[4]==true) {
            updatea(0,-8,0,0);
            penh[4]-=100;
        }
        if(isp[5]==true) {
            updatea(0,-8,0,0);
            penh[5]-=50;
        }
        if(isp[6]==true) {
            updatea(0,-5,0,0);
            penh[6]-=100;
        }
        if(isp[7]==true) {
            updatea(0,-3,0,0);
            penh[7]-=100;
        }
        if(isp[8]==true) {
            updatea(0,-3,0,0);
            penh[8]-=100;
        }
        if(isp[9]==true) {
            updatea(0,-3,0,0);
        }
        if(isp[10]==true) {
            updatea(0,-15,0,0);
            penh[10]-=30;
        }
        if(isp[11]==true) {
            updatea(0,-5,0,0);
            penh[11]-=3;
        }
        if(umur<6) {
        r=Math.random();
        if(r<0.1) {
            r=Math.random();
            if(r<0.2) {
                penyakit(0);
            } else if(r<0.4) {
                penyakit(1);
            } else if(r<0.6) {
                penyakit(2);
            } else if(r<0.8){
                penyakit(3);
            } else {
                penyakit(6);
            }
        }
        }
        if(umur>=18) {
            r=Math.random();
            if(r<0.005) {
                penyakit(10);
            }
        }
        if(umur>=40) {
            r=Math.random();
            if(r<0.01) {
                penyakit(9);
            }
        }
        if(umur>=60) {
            r=Math.random();
            if(r<0.1) {
                r=Math.random();
                if(r<0.1) {
                    penyakit(3);
                } else if(r<0.5) {
                    penyakit(5);
                } else {
                    penyakit(11);
                }
            }
        }
        if(yeara==2020) {
            r=Math.random();
            if(r<0.15) {
                penyakit(4);
            }
        } else if(yeara>2020) {
            r=Math.random();
            if(r<0.005) {
                penyakit(4);
            }
        }
        r=Math.random();
        if(r<0.03) {
            penyakit(7);
        } else if(r<0.05) {
            penyakit(8);
        }
        if(umur<=18) {
        happy+=rand(5)-2;
        health+=rand(5)-2;
        smarts+=rand(5)-2;
        looks+=rand(5)-2;
        } else if(umur<=40) {
        happy+=rand(5)-2;
        health+=rand(4)-2;
        smarts+=rand(5)-2;
        looks+=rand(5)-1;
        } else if(umur<=60) {
        happy+=rand(6)-3;
        health+=rand(5)-3;
        smarts+=rand(5)-2;
        looks+=rand(4)-3;
        } else if(umur<=80) {
            happy+=rand(6)-4;
            health+=rand(5)-4;
            smarts+=rand(5)-2;
            looks+=rand(4)-4;
        } else {
            happy+=rand(6)-4;
            health+=rand(5)-5;
            smarts+=rand(4)-2;
            looks+=rand(6)-6;
        }
        updateb();
        if(sosjoin==true) {
            sosmeda++;
            if(follower<10) {
                follower+=Math.floor(Math.random()*51)+75;
            } else {
            if(follower<500) {
        followa=Math.random()*0.2+1.1;
        } else if(follower<1000) {
            followa=Math.random()*0.08+1.02;
        } else if(follower<2000) {
            followa=Math.random()*0.03+1.01;
        } else {
            followa=Math.random()*0.015+1.005;
        } follower=Math.floor(follower*followa);
            }
        }
        if(ul>0) {
            uang-=ud/4;
            ul-=ud/4;
            if(ul<=0) {
                ul=0;
            }
        }
        if(mobilp==true) {
            mobilu++;
            mobilh=mobilh*0.8;
            mobilk+=rand(5)-5;
            if(mobilk<=0) {
                alert("Kamu harus membuang mobil!");
                mobilp=false;
            }
            if(mobill>0) {
                uang-=mobild/5;
                mobill-=mobild/5;
                if(mobill<=0) {
                    mobill=0;
                }
            }
        }
        if(rumahp==true) {
            rumahu++;
            rumahh=rumahh*1.01;
            rumahk+=rand(2)-1;
            if(rumahl>0) {
                uang-=rumahd/20;
                rumahl-=rumahd/20;
                if(rumahl<=0) {
                    rumahl=0;
                }
            }
        }
        if(kec[0]==true) {
            updatea(0,-16,0,0);
        }
        if(kec[1]==true) {
            updatea(0,-4,0,0);
        }
        if(kec[2]==true) {
            updatea(0,-16,0,0);
        }
        if(kec[3]==true) {
            updatea(0,-4,0,0);
        }
        if(kec[4]==true) {
            updatea(0,-16,0,0);
        }
        if(kec[5]==true) {
            updatea(0,-16,0,0);
        }
        if(bekerja==true) {
            kerjat++;
            naikGaji();
        }
        if(status=="Universitas") {
            ua++;
            if(ua>=4) {
                updatea(0,0,10,0);
                status="Tidak bekerja";
                if(ue==1) {
                    ud=450000000;
                    ul=ud;
                    uang-=ud/4;
                    ul-=ud/4;
                }
            }
        }
        if(status=="SMA") {
            smka++;
            if(smka>=3) {
        updatea(0,0,3,0);
        status="Tidak bekerja";
        if(confirm("Pergi ke universitas?")) {
            univ();
        }
        }
        }
        if(umur>=6&&penjara==false) {
        if(umur<12) {
        if(status=="Infant") {
        alert("Kamu bersekolah di SD.");
        status="SD";
        $("#pekerjaana").attr("class","tmbl-aktif");
        }
        } else if(umur<15) {
        if(status=="SD"||status=="Tidak bekerja") {
        updatea(0,0,2,0);
        switch(kota) {
            case "Jakarta":
            smp=rand(149)+1;
            break;
            default:
            smp=rand(9)+1;
        } 
        alert("Kamu bersekolah di SMPN "+smp+" "+kota+".");
        status="SMP";
        }
        } else if(umur<18) {
        if(status=="SMP") {
            updatea(0,0,3,0);
            r=Math.random();
            if(r<0.7||smarts<25) {
                sman="SMAN";
            } else {
                sman="SMKN";
            }
            switch(kota) {
                case "Jakarta":
                if(sman=="SMAN") {
                    sma=rand(100)+1;
                } else {
                    sma=rand(50)+1;
                }
                break;
                default:
                if(sman=="SMAN") {
                    sma=rand(5)+1;
                } else {
                    sma=rand(3)+1;
                }
            }
            alert("Kamu bersekolah di "+sman+" "+sma+" "+kota+".");
            status="SMA";
            }
        }
        }
        if(umur>=8) {
            $("#krima").attr("class","tmbl-aktif");
        }
        if(umur>=10) {
            $("#kr0").attr("class","tmbl-aktif");
        }
        
        if(umur>=12) {
        $("#minda").attr("class","tmbl-aktif");
        }
        if(umur>=13) {
        $("#asseta").attr("class","tmbl-aktif");
        }
        if(umur>=14) {
            $("#kr1").attr("class","tmbl-aktif");
        }
        if(umur>=16) {
            $("#kr2").attr("class","tmbl-aktif");
        }
        if(umur==17) {
        $("#simb").attr("class","tmbl-aktif");
        if(penjara==false) {
            if(confirm("Dapet SIM?")) {
            if(smarts>=50) {
                alert("Kamu sudah mendapatkan SIM!");
                sim=true;
                simu=0;
                updatea(10,0,0,0);
                } else {
                    simb=true;
                    tolak(-10);
                }
            }
        }
        }
        if(umur>=18) {
            $("#mobil").attr("class","tmbl-aktif");
            $("#rumah").attr("class","tmbl-aktif");
        }
        
        if(umur>=18 && died==false) {
            r = Math.random();
            if(r < 0.001) {
                r = Math.random();
                alert("Kamu tersambar gledek!");
                if(r < 0.5) {
                    updatea(-100,-100,-100,-100);
                } else {
                    updatea(100,100,100,100);
                }
            } else if(r<0.05) {
                r=Math.random();
                if(r<0.16) {
                    if(confirm("Kamu ditawar Heroin")) {
                        updatea(0,-50,0,0);
                        drugt=true;
                        r=Math.random();
                        if(r<0.2) {
                            kecanduan(0);
                        }
                    }
                } else if(r<0.33) {
                    if(confirm("Kamu ditawar Ganja")) {
                        updatea(0,-16,0,0);
                        drugt=true;
                        r=Math.random();
                        if(r<0.2) {
                            kecanduan(1);
                        }
                    }
                } else if(r<0.5) {
                    if(confirm("Kamu ditawar Opium")) {
                        updatea(0,-50,0,0);
                        drugt=true;
                        r=Math.random();
                        if(r<0.2) {
                            kecanduan(2);
                        }
                    }
                } else if(r<0.66) {
                    if(confirm("Kamu ditawar LSD")) {
                        updatea(10,-16,0,0);
                        drugt=true;
                        r=Math.random();
                        if(r<0.2) {
                            kecanduan(3);
                        }
                    }
                } else if(r<0.83) {
                    if(confirm("Kamu ditawar MDMA")) {
                        updatea(0,-50,0,0);
                        drugt=true;
                        r=Math.random();
                        if(r<0.2) {
                            kecanduan(4);
                        }
                    }
                } else {
                    if(confirm("Kamu ditawar Morfin")) {
                        updatea(0,-50,0,0);
                        drugt=true;
                        r=Math.random();
                        if(r<0.2) {
                            kecanduan(5);
                        }
                    }
                }
            }
        }
        if(umur==65 && bekerja==true) {
            bekerja=false;
            gajib=gajib*0.5;
            alert("Kamu harus pensiun. Gaji per bulan Rp"+Math.floor(gajib)+".");
            updatea(20,0,0,0);
            status="Pensiun";
        }
        updatea(0,0,0,0);
        update();
    }

    function penyakit(a) {
        if(isp[a]==false) {
            isp[a]=true;
            alert("Kamu terkena "+peny[a]+".");
            switch(a) {
                case 0:
                case 1:
                case 2:
                case 4:
                case 7:
                case 8:
                case 11:
                penh[a]=Math.random()*100;
                break;
                case 3:
                case 5:
                case 9:
                penh[a]=Math.random()*3000+1000;
                break;
                case 6:
                penh[a]=Math.random()*1500+500;
                break;
                case 10:
                penh[a]=Math.random()*420+80;
            }
        }
    }

    function dokter() {
        if(confirm("Kunjungi dokter?")) {
            for(i=0;i<peny.length;i++) {
                if(penh[i]>0) {
                    penh[i]-=100;
                }
            }
        }
        update();
    }

    function hubungana(a,b) {
        switch(b) {
            case 0:
            hubr[a]-=50;
            break;
            case 1:
            alert("Aku panggil dia "+hina[rand(hina.length)]+".")
            hubr[a]-=10;
            break;
            case 2:
            hubme=parseInt(prompt("Memberi uang"));
            if(uang>=hubme&&hubma[a]==false) {
                hubma[a]=true;
                if(hubme<1000000) {
                    hubr[a]+=1;
                } else if(hubme<10000000) {
                    hubr[a]+=2;
                } else if(hubme<100000000) {
                    hubr[a]+=5;
                } else if(hubme<500000000){
                    hubr[a]+=10;
                } else {
                    hubr[a]+=15;
                }
            }
            uanga(hubme);
            break;
            case 3:
            if(hubim[a]==false) {
            hubim[a]=true;
            hubr[a]+=10;
            }
            break;
            case 4:
            if(hubiw[a]==false) {
            hubiw[a]=true;
            if(hubr[a]>=10) {
            updatea(5,0,0,0);
            hubr[a]+=10;
            }
            }
            if(hubr[a]<10) {
                alert("Dia tidak mau menghabiskan waktu bersamamu.");
                updatea(-10,0,0,0);
            }
            break;
            case 5:
            if(hubr[a]>=10&&hubm[a]>=10&&hubmi[a]==false) {
                hubmi[a]=true;
                        humb=(rand(9000)+1000)*hubm[a];
                if(umur>=18) {
                    humb=humb*10;
                }
                uang+=humb;
                alert("Dia memberimu uang sebesar Rp"+humb);
                hubr[a]-=5;
            } else {
                alert("Dia tidak mau memberimu uang.");
                hubr[a]-=10;
            }
        }
        if(hubr[a]<0) {
            hubr[a]=0;
        } else if(hubr[a]>100) {
            hubr[a]=100;
        }
        back();
        update();
    }

    function hubmen(a) {
    if(hub[a]==true) {
        hub[a]=false;
        switch(a) {
            case 0:
            updatea(-50,0,0,0);
            if(hubr[a]>30&&hubm[a]>=10) {
            humb=(rand(100000000)+10000000)*hubm[a];
            uang+=humb;
            alert("Bapakmu sudah meninggal! Kamu diwariskan Rp"+humb+".");
            updatea(10,0,0,0);
            } else {
            alert("Bapakmu sudah meninggal!");
            }
            break;
            case 1:
            updatea(-50,0,0,0);
            if(hubr[a]>30&&hubm[a]>=10) {
            humb=rand(1000000000*hubm[a])+100000000*hubm[a];
            uang+=humb;
            alert("Ibumu sudah meninggal! Kamu diwariskan Rp"+humb+".");
            updatea(10,0,0,0);
            } else {
            alert("Ibumu sudah meninggal!");
            }
        }
    }
    }

    function serangan() {
        r=Math.random();
        if(r<0.4) {
            alert("Awwww");
            window.navigator.vibrate(500);
            updatea(-10,-4,0,0);
        } else if(r<0.7) {
            alert("Awwww");
            window.navigator.vibrate(500);
            updatea(-10,-8,0,0);
        } else if(r<0.9) {
            alert("Awwww");
            window.navigator.vibrate(1000);
            updatea(-10,-15,0,0);
        } else if(r<0.99) {
            alert("Awwww");
            window.navigator.vibrate(1500);
            updatea(-10,-30,0,0);
        } else {
            r=Math.random();
            if(r<0.5) {
                alert("Kamu berhasil menghindar.");
            } else if(r<0.8) {
                alert("Awwww");
                window.navigator.vibrate(2000);
                updatea(-50,-50,0,0);
            } else {
                alert("Awwww");
                window.navigator.vibrate(2000);
                updatea(-50,-100,0,0);
            }
        }
    }

    function back() {
    $("#game").show();
        $("#menu").show();
        $("#pekerjaan").hide();
        $("#mind").hide();
        $("#asset").hide();
        $("#hubungan").hide();
        $("#krime").hide();
    }

    function pekerjaan() {
        if(umur>=6) {
        $("#game").show();
            $("#menu").hide();
            $("#pekerjaan").show();
    $("#kerjaan").hide();
        }
    }

    function mind() {
    if(umur>=12) { 
    $("#menu").hide();
    $("#mind").show();
    }
    }

    function asset() {
        if(umur>=13) {
        $("#game").show();
            $("#menu").hide();
    $("#asset").show();
    $("#mobila").hide();
    $("#rumaha").hide();
        }
    }

    function krima() {
        if(umur>=8) {
        $("#menu").hide();
            $("#krime").show();
        }
    }

    function kriminal(a) {
        switch(a) {
            case 0:
            if(umur>=10) {
                for(i=0;i<3;i++) {
                    kraa[i]=rand(75)+25;
                if(kraa[i]<50) {
                    krab[i]=rand(51);
                    } else if(kraa[i]<75) {
                        krab[i]=rand(61);
                    } else if(kraa[i]<85) {
                        krab[i]=rand(71);
                    } else if(kraa[i]<90) {
                        krab[i]=rand(81);
                    } else if(kraa[i]<95) {
                        krab[i]=rand(91);
                    } else {
                        krab[i]=rand(101);
                    }
                    krac[i]=rand(1000)/100;
                }
                kra=prompt("Pilih target:\n1 = Keamanan: "+kraa[0]+"%, Harta: "+krab[0]+"%, Jarak: "+krac[0]+" km\n2 = Keamanan: "+kraa[1]+"%, Harta: "+krab[1]+"%, Jarak: "+krac[1]+" km\n3 = Keamanan: "+kraa[2]+"%, Harta: "+krab[2]+"%, Jarak: "+krac[2]+" km");
                switch(kra) {
                    case "1":
                    case "2":
                    case "3":
                    r=Math.random();
                    if(r>kraa[parseInt(kra,10)-1]/100) {
                        krb=(rand(900000)+100000)*krab[parseInt(kra,10)-1];
                        uang+=krb;
                        alert("Kamu berhasil, kamu membawa pulang uang sebesar Rp"+krb+".");
                    } else {
                        r=Math.random();
                        if(r<0.3) {
                            if(smarts>=50) {
                            alert("Kamu gagal, kamu sudah melarikan diri sebelum ada polisi.");
                            } else {
                                alert("Kamu gagal. Pemilik rumah memanggil polisi.");
                            masukp(rand(11)+5);
                            }
                        } else if(r<0.5&&rkr==false) {
                            alert("Kamu gagal. Pemilik rumah menyerangmu.");
                            serangan();
                        } else {
                            alert("Kamu gagal. Pemilik rumah memanggil polisi.");
                            masukp(rand(11)+5);
                        }
                    }
                }
            }
            break;
            case 1:
            if(umur>=14) {
                
            }
            break;
            case 2:
            if(umur>=16) {
                
            }
            break;
            case 3:
            for(i=0;i<5;i++) {
                r=Math.random();
                if(r<0.1) {
                    kraa[i]=rand(1001)*1000;
                } else if(r<0.3) {
                    kraa[i]=rand(501)*1000;
                    } else if(r<0.5) {
                    kraa[i]=rand(101)*1000;
                } else if(r<0.7) {
                    kraa[i]=rand(11)*1000;
                } else {
                    kraa[i]=0;
                }
                }
                kra=prompt("Pilih target: 1, 2, 3, 4, 5");
                switch(kra) {
                    case "1":
                    case "2":
                    case "3":
                    case "4":
                    case "5":
                    r=Math.random();
                    if(r<0.5) {
                        krb=kraa[parseInt(kra,10)-1];
                        uang+=krb;
                        if(krb>0) {
                            alert("Kamu berhasil mencopet Rp"+krb+".");
                        } else {
                            alert("Kamu berhasil tapi isi dompet kosong.");
                        }
                    } else {
                        r=Math.random();
                        if(r<0.5&&rkr==false) {
                            alert("Kamu gagal. Si korban sudah lari duluan.");
                        } else if(r<0.7&&rkr==false) {
                            alert("Kamu gagal. Si korban menyerangmu.");
                            serangan();
                        } else {
                            alert("Kamu gagal. Si korban memanggil polisi.");
                            masukp(rand(4)+1);
                        }
                    }
                }
        }
        update();
    }

    function masukp(a) {
        penjara=true;
        rkr=true;
        pjt+=a;
        alert("Kamu dipenjara selama "+pjt+" tahun.");
        if(bekerja==true) {
            pecat("Rekor kriminal");
        }
        back();
        $("#menu").hide();
        $("#pj").show();
        status="Di penjara";
        updatea(-100,0,0,0);
        update();
    }

    function kabur() {
        if(pjk==false) {
        if(confirm("Mau kabur dari penjara?")) {
        r=Math.random();
        if(r<0.7&&smarts>=90) {
            bebasp();
        } else if(r<0.5&&smarts>=70) {
            bebasp();
        } else if(r<0.3&&smarts>=50) {
            bebasp();
        } else if(r<0.2&&smarts>=30) {
            bebasp();
        } else if(r<0.1&&smarts>=10) {
            bebasp();
        } else {
            pjt+=rand(4)+2;
            alert("Kamu ketangkap dan hukuman ditambah menjadi "+pjt+" tahun.");
            pjk=true;
            updatea(-10,0,0,0);
        }
        }
        } else {
            alert("Kamu tidak bisa mencari cara untuk kabur.");
        }
        update();
    }

    function rusuh() {
        if(confirm("Memulai kerusuhan?")) {
        r=Math.random();
        if(r<0.25) {
            alert("Kamu memulai kerusuhan\n"+(rand(41)+10)+" orang terluka");
        } else if(r<0.5) {
            alert("Kamu memulai kerusuhan\n"+(rand(41)+10)+" orang terluka\n"+(rand(5)+1)+" orang meninggal dunia");
        } else if(r<0.75) {
            alert("Kamu memulai kerusuhan\n"+(rand(41)+10)+" orang terluka\nKamu diserang.");
            serangan();
        } else {
            alert("Kamu memulai kerusuhan\n"+(rand(41)+10)+" orang terluka\n"+(rand(5)+1)+" orang meninggal dunia\nKamu diserang.");
            serangan();
        }
        r=Math.random();
        if(r<0.3) {
            pjt+=rand(2)+1;
            alert("Hukuman ditambah menjadi "+pjt+" tahun.");
            updatea(-10,0,0,0);
        }
        update();
        }
    }

    function bebasp() {
    alert("Kamu bebas dari penjara.");
    penjara=false;
    status="Tidak bekerja";
    updatea(20,0,0,0);
        $("#pj").hide();
        $("#menu").show();
    }

    function ged() {
    if(umur>=15&&smka<3) {
    if(status=="Tidak bekerja"||status=="Bekerja"||status=="Pensiun") {
        if(uang>=15000000) {
            alert("Kamu lulus tes GED!");
            smka=3;
            $("#ged").attr("class","");
        }
        uanga(15000000);
        update();
        }
        }
    }

    function univ() {
    if(umur>=18) {
            if(status=="Tidak bekerja"&&ua<4) {
            if(smarts>=25&&smka>=3) {
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
        u=a;
        universitas();
    }

    function universitas() {
    $("#un").html("Jurusan: "+uc[u]);
        $("#univer").hide();
        $("#univers").show();
    }

    function univers(a) {
        ue = a;
        switch(ue) {
            case 0:
            if(smarts>=90) {
                $("#univers").hide();
                $("#game").show();
                status="Universitas";
            } else {
                tolak(0);
            }
            break;
            case 1:
            $("#univers").hide();
            $("#game").show();
            status="Universitas";
            break;
            case 2:
            $("#univers").hide();
            $("#univer").show();
            break;
            case 3:
            $("#univers").hide();
            $("#game").show();
            status="Tidak bekerja";
        }
        update();
    }

    function hubungan() {
        $("#game").hide();
        $("#hubungan").show();
        for(i=0;i<2;i++) {
        if(hub[i]==true) {
        if(hubr[i]<=15) { 
        document.getElementById('hub'+i).html('Umur: '+hubu[i]+' tahun<br>Hubungan:<br><div class="statsa" style="width:100%"><div class="stats" style="width:'+hubr[i]+'%;background:#ff0000"></div></div>');
        } else if(hubr[i]<=30) {
            document.getElementById('hub'+i).html('Umur: '+hubu[i]+' tahun<br>Hubungan:<br><div class="statsa" style="width:100%"><div class="stats" style="width:'+hubr[i]+'%;background:#ffa500"></div></div>');
        } else {
            document.getElementById('hub'+i).html('Umur: '+hubu[i]+' tahun<br>Hubungan:<br><div class="statsa" style="width:100%"><div class="stats" style="width:'+hubr[i]+'%;background:#00ff00"></div></div>');
        }
        if(hubm[i]<=15) {
            document.getElementById('hubm'+i).html('Pekerjaan: '+hubk[i]+'<br>Uang:<br><div class="statsa" style="width:100%"><div class="stats" style="width:'+hubm[i]+'%;background:#ff0000"></div></div>');
        } else if(hubm[i]<=30) {
            document.getElementById('hubm'+i).html('Pekerjaan: '+hubk[i]+'<br>Uang:<br><div class="statsa" style="width:100%"><div class="stats" style="width:'+hubm[i]+'%;background:#ffa500"></div></div>');
        } else {
            document.getElementById('hubm'+i).html('Pekerjaan: '+hubk[i]+'<br>Uang:<br><div class="statsa" style="width:100%"><div class="stats" style="width:'+hubm[i]+'%;background:#00ff00"></div></div>');
        }
            if(umur<6) {
                $("#huba"+i).hide();
            } else {
                $("#huba"+i).show();
            }
            } else {
                $("#hub"+i).html("<i>Sudah meninggal dunia.</i>");
                $("#hubm"+i).hide();
                $("#huba"+i).hide();
            }
        }
    }

    function kerja() {
        if(umur<15) {
        if(umur>=6) {
            alert("Orang tuamu tidak memperbolehkan kamu berhenti sekolah.");
            }
        } else if(status=="SMA") {
            smka=0;
            alert("Kamu berhenti sekolah.");
            $("#ged").attr("class","tmbl-aktif");
            status="Tidak bekerja";
        } else if(status=="Universitas") {
            ua=0;
            alert("Kamu berhenti sekolah.");
            status="Tidak bekerja";
        } else if(umur<65){
        if(bekerja==false) {
        $("#game").hide();
        $("#kerjaan").show();
        kerjaan();
            } else {
                bekerja=false;
                gajib=0;
                kerjat=0;
                alert("Kamu sudah berhenti kerja.");
                status="Tidak bekerja";
            }
        } else {
            alert("Kamu terlalu tua untuk bekerja!");
        }
        update();
    }

    function kerjaan() {
        if(kerjac==false) {
        kerjac=true;
        for(i=0;i<8;i++) {
        kerjam=document.createElement("div");
        kerjam.attr("class","menuc");
        kerjam.html('<p><b id="kerja'+i+'"></b></p><p id="gaji'+i+'"></p><button onclick="kerjaa('+i+')" class="tmbl-aktif">Kerja</button>');
        kerjar[i]=Math.floor(Math.random()*kerjad.length);
        gaji[i]=Math.floor(Math.random()*0.3*gmin[kerjar[i]])+gmin[kerjar[i]];
        if(kerjan==false) { 
        $("#kerjaan").appendChild(kerjam);
        }
        if(i==7) {
            kerjan=true;
        }
        $("#kerja"+i).html(kerjad[kerjar[i]]);
        $("#gaji"+i).html("Karir: "+kerjad[karird[kerjar[i]]]+"<br>Gaji/bulan: Rp"+gaji[i]);
        }
        }
    }

    function kerjaa(a) {
        i=a;
        kerjab=kerjar[a];
        switch(kerjab) {
        case 0:
        if(ua>=4 && drugt==false && rkr==false) {
        if(u==6||u==9) {
            dapatKerja();
            } else {
                tolak(-10);
            }
        } else {
            tolak(-10);
        }
        break;
        case 1:
        if(ua>=4 && u==2 && drugt==false && rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 2:
        if(ua>=4 && drugt==false && rkr==false) {
            if(u==6||u==9) {
                dapatKerja();
            } else {
                tolak(-10);
            }
        } else {
            tolak(-10);
        }
        break;
        case 3:
        if(happy>=50 && health>=50 && smka>=3 && drugt==false && rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 4:
        if(happy>=30 && health>=30 && drugt==false && rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 5:
        dapatKerja();
        break;
        case 6:
        if(happy>=50 && health>=50 && smka>=3 && drugt==false && rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 7:
        if(happy>=50 && health>=50 && drugt==false && rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 8:
        if(drugt==false && rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 9:
        if(pk[0]>=1&&drugt==false&&rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 10:
        if(pk[0]>=2&&drugt==false&&rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 11:
        if(ua>=4&&u==2&&drugt==false&&rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 12:
        if(pk[1]>=2&&drugt==false&&rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 13:
        if(ua>=4&&drugt==false&&rkr==false) {
        if(u==6||u==9) {
            dapatKerja();
            }
        } else {
            tolak(-10);
        }
        break;
        case 14:
        if(pk[2]>=1&&drugt==false&&rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 15:
        if(smka>=3&&drugt==false&&rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 16:
        if(pk[3]>=1&&drugt==false&&rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 17:
        if(smka>=3&&drugt==false&&rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        break;
        case 18:
        if(pk[4]>=1&&drugt==false&&rkr==false) {
            dapatKerja();
        } else {
            tolak(-10);
        }
        }
    update();
    }

    function dapatKerja() {
            updatea(10,0,0,0);
            gajib=gaji[i];
            alert("Kamu mendapat pekerjaan sebagai "+kerjad[kerjab]+". Gaji per bulan Rp"+Math.floor(gajib)+".");
            bekerja=true;
            status="Bekerja";
            pekerjaan();
    }

    function naikGaji() {
        if(kerjat==5||kerjat==10||kerjat==15||kerjat==20||kerjat==25||kerjat==30||kerjat==35||kerjat==40||kerjat==45) {
            gajia=Math.random()*0.05+1.05;
            gajib=gajib*gajia;
        }
        if(drugt==true) {
            if(kerjab<=4) {
                pecat("Gagal tes narkoba");
            }
            if(kerjab>=6) {
                pecat("Gagal tes narkoba");
            }
        }
        if(happy<30||health<30) {
            if(kerjab==3||kerjab==4||kerjab==6||kerjab==7) {
                pecat("Perfomance");
            }
        }
        if(kerjab==0&&kerjat==3) {
            pk[0]=1;
            naikPangkat(9);
        }
        if(kerjab==9&&kerjat==3) {
            pk[0]=2;
            naikPangkat(10);
        }
        if(kerjab==1&&kerjat==3) {
            naikPangkat(11);
        }
        if(kerjab==11&&kerjat==3) {
            pk[1]=2;
            naikPangkat(12);
        }
        if(kerjab==2&&kerjat==3) {
            naikPangkat(13);
        }
        if(kerjab==13&&kerjat==3) {
            pk[2]=1;
            naikPangkat(14);
        }
        if(kerjab==15&&kerjat==3) {
            pk[3]=1;
            naikPangkat(16);
        }
        if(kerjab==17&&kerjat==3) {
            pk[4]=1;
            naikPangkat(18);
        }
    }

    function naikPangkat(a) {
        kerjab=a;
        kerjat=0;
        gajib=Math.floor(Math.random()*0.3*gmin[kerjab])+gmin[kerjab];
        alert("Kamu naik pangkat menjadi "+kerjad[kerjab]+". Gaji kamu sekarang "+gajib+".");
        updatea(20,0,0,0);
    }

    function pecat(a) {
    if(bekerja==true) {
        alert("Kamu dipecat dari pekerjaan sebagai "+kerjad[kerjab]+". Alasan: "+a);
        bekerja=false;
        kerjat=0;
        gajib=0;
        status="Tidak bekerja";
        updatea(-100,0,0,0);
        }
    }

    function tolak(a) {
        alert("Maaf. Kamu tidak bisa.");
        updatea(a,0,0,0);
    }

    function gym() {
    if(health>=10) {
        if(umur<18) {
        if(gyma==false) {
            updatea(4,4,0,0);
            gyma=true;
            }
        } else {
            if(uang >= 150000 && gyma==false) {
            updatea(4,4,0,0);
            gyma=true;
            }
            uanga(150000);
        }
        } else {
            alert("Kamu tidak bisa ikut gym karena kamu terlalu lemah.");
        }
        update();
    }

    function perpus() {
        if(per==false) {
            per=true;
            updatea(0,0,3,0);
        }
        update();
    }

    function sosmed() {
        if(sosjoin==false) {
            if(confirm("Gabung sosial media?")) {
                sosjoin=true;
            }
        } else {
            sosa=prompt("Sosial Media\nFollower: "+follower+"\nAktif: "+sosmeda+" tahun\nPost: "+spost+"\n1 = Post\n2 = Hapus");
            switch(sosa) {
                case "1":
                spost++;
                if(sosp==false) {
                    sosp=true;
                    updatea(3,0,0,0);
                    if(follower==0) {
                        follower+=Math.floor(Math.random()*6);
                    } else {
                    followa=Math.random()*0.05+1.01; follower=Math.floor(follower*followa);
                    }
                }
                break;
                case "2":
                sosjoin=false;
                sosmeda=0;
                follower=0;
                spost=0;
            }
        }
        update();
    }

    function sima() {
    if(umur>=17) {
        if(sim==false) {
        if(simb==false) {
                if(smarts>=50) {
                alert("Kamu sudah mendapatkan SIM!");
                sim=true;
                simu=0;
                updatea(10,0,0,0);
                } else {
                    simb=true;
                    tolak(-10);
                }
        } else {
        uanga(75000);
        if(uang >= 75000) {
        if(smarts < 50) {
            r = Math.random();
            if(r > 0.5) {
                alert("Kamu sudah mendapatkan SIM!");
                sim=true;
                simu=0;
                updatea(10,0,0,0);
            } else {
                tolak(0);
            }
        } else {
            alert("Kamu sudah mendapatkan SIM!");
            sim=true;
            simu=0;
            updatea(10,0,0,0);
        }
        }
        }
        } else {
            alert("Kamu sudah mendapatkan SIM! Tahun terlisensi: "+simu);
        }
        update();
        }
    }

    function kecanduan(a) {
        if(kec[a]!=true) {
        kec[a]=true;
        switch(a) {
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
        updatea(-10,0,0,0);
        }
    }

    function mobil() {
    if(umur>=18) {
            if(sim==true) {
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
    if(mobilt==false) {
        mobilt=true;
        for(i=0;i<8;i++) {
            mobilhh[0]=Math.random()*5000000000+5000000000;
            mobilhh[1]=Math.random()*3000000000+2000000000;
            mobilhh[2]=Math.random()*1000000000+1000000000;
            mobilhh[3]=Math.random()*500000000+500000000;
            mobilhh[4]=Math.random()*200000000+300000000;
                        mobilhh[5]=Math.random()*200000000+100000000;
                mobilhh[6]=Math.random()*150000000+50000000;
                mobilhh[7]=Math.random()*70000000+30000000;
            if(mobilhh[i]<100000000) {
                mobiluu[i]=rand(16)+5;
            } else if(mobilhh[i]<300000000) {
                mobiluu[i]=rand(6);
            } else if(mobilhh[i]<500000000) {
                mobiluu[i]=rand(4);
            } else {
                mobiluu[i]=0;
            }
            if(mobiluu[i]==0) {
                mobilkk[i]=100;
            } else if(mobiluu[i]<=2) {
                mobilkk[i]=rand(5)+95;
            } else if(mobiluu[i]<=5) {
                mobilkk[i]=rand(7)+90;
            } else if(mobiluu[i]<=10) {
                mobilkk[i]=rand(11)+80;
            } else if(mobiluu[i]<=15) {
                mobilkk[i]=rand(21)+70;
            } else {
                mobilkk[i]=rand(26)+50;
            }
            mobilm=document.createElement("div");
            mobilm.attr("class","menuc");
            mobilm.html('<p><b id="mobil'+i+'"></b></p><p id="mobilh'+i+'"></p><button onclick="mobilc('+i+')" class="tmbl-aktif">Cicilan</button><button onclick="mobiln('+i+')" class="tmbl-aktif">Lunas</button>');
        if(mobilmm==false) {
            $("#mobila").appendChild(mobilm);
        }
            $("#mobil"+i).html("Mobil");
            $("#mobilh"+i).html("Harga: Rp"+Math.floor(mobilhh[i])+"<br>Umur: "+mobiluu[i]+" tahun<br>Kondisi: "+mobilkk[i]+"%");
            if(i==7) {
                mobilmm=true;
            }
    }
    }
    update();
    }

    function mobilc(a) {
    if(status=="Bekerja"||status=="Pensiun") {
            mobilh.push(mobilhh[a]);
            mobild=mobilh;
            if(uang>=mobild/5) {
            mobill=mobild;
            mobill-=mobild/5;
            mobilu.push(mobiluu[a]);
            mobilk.push(mobilkk[a]);
            //mobilh=mobilh*0.8;
            mobilm=document.createElement("div");
            mobilm.attr("class","menuc");
            mobilm.html('<p><b>Mobil</b></p><p id="mobilhh'+mj+'"></p><button onclick="" class="tmbl-hub">Lunas</button><button onclick="" class="tmbl-hub">Jual</button>');
            $("#mobilp").appendChild(mobilm);
            $("#mobilhh"+mj).html("Harga: Rp"+Math.floor(mobilh[mj])+"<br>Cicilan: Rp"+Math.floor(mobill)+"<br>Umur: "+mobilu[mj]+" tahun<br>Kondisi: "+mobilk[mj]+"%");
            mj++;
            asset();
            }
            uanga(mobild/5);
            } else {
                alert("Kamu harus punya pekerjaan!");
            }
            update();
    }

    function mobiln(a) {
        if(uang>=mobilhh[a]) {
            mobilp=true;
            mobilh=mobilhh[a];
            mobilu=mobiluu[a];
            mobilk=mobilkk[a];
            mobilh=mobilh*0.8;
            asset();
        }
        uanga(mobilhh[a]);
        update();
    }

    function jualMobil() {
        alert("Mobilmu terjual!")
        uang+=mobilh-mobill;
        mobilp=false;
        mobill=0;
    }

    function rumah() {
    if(umur>=18) {   
        if(rumahp==false) {
            $("#game").hide();
            $("#rumaha").show();
            beliRumah();
        } else {
            rumaha=prompt("Beli rumah\n"+br+"br/"+ba+"ba\nHarga: Rp"+Math.floor(rumahh)+"\nCicilan: Rp"+Math.floor(rumahl)+"\nUmur: "+rumahu+" tahun\nKondisi: "+rumahk+"%\n1 = Lunas\n2 = Jual\n3 = Renovasi");
            switch(rumaha) {
                case "1":
                if(rumahl>0) {
                    if(uang>=rumahl) {
                            uang-=rumahl;
                            rumahl=0;
                            alert("Rumahmu sudah lunas!");
                    } else {
                    alert("Uang kamu tidak mencukupi!");
                    }
                } else {
                    alert("Rumahmu sudah lunas!");
                }
                break;
                case "2":
                r=Math.random();
                if(rumahk>=90 && rumahu<=5) {
                    jualRumah();
                } else if(rumahk>=70 && rumahu<=30 && r<0.7) {
                jualRumah();
                } else if(rumahk>=50 && r<0.5) {
                jualRumah();
                } else if(rumahk>=30 && r<0.3) {
                jualRumah();
                } else if(rumahk>=10 && r<0.2) {
                jualRumah();
                } else if(r<0.1) {
                jualRumah();
                } else {
                    alert("Tidak ada yang mau beli rumahmu.");
                }
                break;
                case "3":
                renovh=[Math.floor(rumahh*0.01),Math.floor(rumahh*0.02),Math.floor(rumahh*0.05),Math.floor(rumahh*0.1),Math.floor(rumahh*0.2)];
                renov = prompt("Pilih budget:\n1 = Rp"+renovh[0]+"\n2 = Rp"+renovh[1]+"\n3 = Rp"+renovh[2]+"\n4 = Rp"+renovh[3]+"\n5 = Rp"+renovh[4]);
                switch(renov) {
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
    if(rumaht==false) {
    rumaht=true;
        for(i=0;i<8;i++) {
            rumahhh[0]=Math.random()*70000000000+30000000000;
            rumahhh[1]=Math.random()*40000000000+10000000000;
            rumahhh[2]=Math.random()*15000000000+5000000000;
            rumahhh[3]=Math.random()*7000000000+3000000000;
            rumahhh[4]=Math.random()*4000000000+1000000000;
                        rumahhh[5]=Math.random()*1500000000+500000000;
                rumahhh[6]=Math.random()*400000000+100000000;
                rumahhh[7]=Math.random()*150000000+50000000;
            if(rumahhh[i]<200000000) {
                rumahuu[i]=rand(51)+20;
                rbr[i]=1;
                rba[i]=1;
            } else if(rumahhh[i]<400000000) {
                rumahuu[i]=rand(36)+15;
                rbr[i]=rand(2)+1;
                rba[i]=rand(2)+1;
            } else if(rumahhh[i]<2000000000){
                rumahuu[i]=rand(31);
                rbr[i]=rand(3)+2;
                rba[i]=rand(3)+2;
            } else if(rumahhh[i]<5000000000) {
                rumahuu[i]=rand(16);
                rbr[i]=rand(4)+2;
                rba[i]=rand(4)+2;
            } else if(rumahhh[i]<10000000000){
                rumahuu[i]=rand(6);
                rbr[i]=rand(5)+3;
                rba[i]=rand(5)+3;
            } else {
                rumahuu[i]=rand(4);
                rbr[i]=rand(7)+4;
                rba[i]=rand(7)+4;
            }
            if(rumahuu[i]<=2) {
                rumahkk[i]=100;
            } else if(rumahuu[i]<=10) {
                rumahkk[i]=rand(11)+90;
            } else if(rumahuu[i]<=20) {
                rumahkk[i]=rand(21)+80;
            } else if(rumahuu[i]<=30) {
                rumahkk[i]=rand(31)+70;
            } else if(rumahuu[i]<=50) {
                rumahkk[i]=rand(51)+50;
            } else {
                rumahkk[i]=rand(81)+20;
            }
            rumahm=document.createElement("div");
            rumahm.attr("class","menuc");
            rumahm.html('<p><b id="rumah'+i+'"></b></p><p id="rumahh'+i+'"></p><button onclick="rumahc('+i+')" class="tmbl-aktif">Cicilan</button><button onclick="rumahn('+i+')" class="tmbl-aktif">Lunas</button>');
            if(rumahmm==false) {
                $("#rumaha").appendChild(rumahm);
            } $("#rumah"+i).html("Rumah ("+rbr[i]+"br/"+rba[i]+"ba)");
            $("#rumahh"+i).html("Harga: Rp"+Math.floor(rumahhh[i])+"<br>Umur: "+rumahuu[i]+" tahun<br>Kondisi: "+rumahkk[i]+"%");
            if(i==7) {
                rumahmm=true;
            }
    }
    }
    update();
    }

    function rumahc(a) {
    if(status=="Bekerja"||status=="Pensiun") {
    rumahh=rumahhh[a];
            rumahd=rumahh;
            if(uang>=rumahd/5) {
            rumahl=rumahd;
            rumahl-=rumahd/5;
            rumahu=rumahuu[a];
            rumahk=rumahkk[a];
            br=rbr[a];
            ba=rba[a];
            rumahp=true;
            asset();
            }
            uanga(rumahd/5);
            } else {
                alert("Kamu harus punya pekerjaan!");
            }
            update();
    }

    function rumahn(a) {
        if(uang>=rumahhh[a]) {
            rumahp=true;
            rumahh=rumahhh[a];
            rumahu=rumahuu[a];
            rumahk=rumahkk[a];
            br=rbr[a];
            ba=rba[a];
            asset();
        }
        uanga(rumahhh[a]);
        update();
    }

    function jualRumah() {
        alert("Rumahmu terjual!");
        uang+=rumahh-rumahl;
        rumahp=false;
        rumahl=0;
    }

    function renovasi(a) {
        if(uang>=renovh[a]) {
            switch(a) {
                case 0:
            if(rumahk<100) {
                rumahh=rumahh*1.01;
            }
                rumahk+=2;
            break;
                case 1:
                if(rumahk<=96) {
                rumahh=rumahh*1.02;
                }
                rumahk+=4;
                break;
                case 2:
                if(rumahk<=91) {
                    rumahh=rumahh*1.05;
                }
                rumahk+=10;
                case 3:
                if(rumahk<=83) {
                    rumahh=rumahh*1.1;
                } else if(rumahk<=91) {
                    rumahh=rumahh*1.05;
                }
                rumahk+=20;
                break;
                case 4:
                if(rumahk<=66) {
                    rumahh=rumahh*1.2;
                } else if(rumahk<=83) {
                    rumahh=rumahh*1.1;
                } else if(rumahk<=91) {
                    rumahh=rumahh*1.05;
                }
                rumahk+=40;
            }
        }
        uanga(renovh[a]);
        if(rumahk>100) {
            rumahk=100;
        }
    }

    function meninggal() {
    if(died==false) {
    died=true;
    alert("Kamu sudah meninggal dunia!");
    document.write("Nama kamu " + nama + ". Kamu adalah "+gd+". Kamu lahir tanggal " + day + " " + month[mon-1] + " "+year+". Umur kamu " + umur + " tahun.");
    }
    }

    var gender, gd, nama;
        var mon, day, daya=[31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31], month=["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"], year, yeara;
        var umur=0, status="Infant", happy, health, smarts, looks;
        var uang=0, gaji=new Array(8), gmin=[12000000,15000000,12000000,12000000,7000000,4000000,12000000,//6
        8000000,4000000,24000000,42000000,27000000,45000000,//12
        24000000,42000000,12000000,24000000,12000000,24000000], gajia, gajib=0;
        var kra, kraa=new Array(3), krab=new Array(3), krac=new Array(3), krb, penjara=false, pjt=0, pjk=false, rkr=false;
        var smp, gyma, per, sman, sma, smka=0;
        var peny=["Batuk rejan","Campak","DBD","Kanker",//3
        "Coronavirus","Alzheimer","Epilepsi","Flu",//7
        "Diare","Diabetes","Tubercolosis","Penyakit jantung"], isp=new Array(peny.length), penh=new Array(peny.length);
        var u, ua=0, uc=["Biologi","Inggris","Keuangan","Kimia","Matematika","Psikologi","Sains Komputer","Sains Politik","Sejarah","Sistem Informasi"], ud, ue, ul;
        var bekerja=false, kerjab, kerjac=false, kerjad=["Jr. App Developer","Jr. Banker","Jr. Computer Programmer","Pemadam Kebakaran","Petani","Petugas Kebersihan","Polisi",//6
        "Satpam","Tukang Sampah","App Developer","Sr. App Developer","Banker",//11
        "Sr. Banker","Computer Programmer","Sr. Computer Programmer","Kameramen Magang","Kameramen","Fotografer Magang","Fotografer"], kerjar=new Array(8), kerjam, kerjan=false, kerjat=0, pk=new Array(5), karird=[9,11,13,3,4,5,6,//6
        7,8,9,9,11,11,13,13,//14
        16,16,18,18];
        var sosjoin=false, follower=0, followa, sosmeda=0, sosa, sosp=false, spost=0;
        var sim=false, simb=false, simu, r, i, j, drugt=false, kec=new Array(6), died=false;
        var mobilp=[], mj=0, mobila=[], mobilt=false, mobilh=[], mobilhh=new Array(8), mobilu=[], mobiluu=new Array(8), mobilk, mobilkk=new Array(8), mobilm, mobilmm=false, mobild, mobill=0;
        var rumahp=false, rj=0, rumaha, rumaht=false, rumahh, rumahhh=new Array(8), rumahu, rumahuu=new Array(8), rumahk, rumahkk=new Array(8), rbr=new Array(8), br, rba=new Array(8), ba, rumahm, rumahmm=false, rumahd, rumahl=0, renov, renovh=new Array(5);
        var fnamal=["Aadiktri","Aavya","Amara","Anik","Anil","Arpit","Ayaan","Banil","Buyisiwe","Cleveland","Dinesh","Donya","Dhule","Dube","Dungi","Dunyi","Gordon","Kabir","Kabul","Kadir","Leuwinanggung","Lucuss","Maxim","Megah","Om","Omnia","Opiyo","Panutan","Pramana","Rajiv","Rohit","Roman","Sama","Samar","Sebastian","Tej","Zhiqiang"], fnamap=["Aasmi","Celine","Eka","Ekenedilichukwu","Maria","Navya","Omnia","Selena","Serena","Suyin","Tasty","Zhiqiuno"], lnama=["Achaval","Apolles","Bhate","Bhatta","Bhave","Chakarbarti","Charlier","Dikshit","Ethulo","Gayakvade","Gerung","Gerungan","Goossens","Gordon","Gulati","Ho","Hu","Ijendu","Jamus","Kamal","Ketanggungan","Khan","Khatri","Kohli","Krueger","Kumar","Modi","Misra","Nasution","Nunes","Pagar","Perry","Pertanggungan","Sakuda","Salib","Sellers","Spinx","Shah","Stepanovna","Tambunan","Thakore","Thakre","Verheyen","Wang","Wong"];
        var hub=[true,true], hubn=[fnamal[rand(fnamal.length)]+" "+lnama[rand(lnama.length)],fnamap[rand(fnamap.length)]+" "+lnama[rand(lnama.length)]], hubu=[rand(33)+18,rand(33)+18],hubr=[rand(21)+80,rand(21)+80], hina=["anjing","asw","bangsat","babi","bau","bodoh","goblok","jelek","k*ntl","tai"], hubma=[false,false],hubme, hubim=[false,false],hubiw=[false,false], hubk=[kerjad[karird[rand(kerjad.length)]],kerjad[karird[rand(kerjad.length)]]], hubm=[rand(101),rand(101)],hubmi=[false,false],humb;
            for(i=0;i<peny.length;i++) {
                isp[i]=false;
                penh[i]=0;
            }
        happy=rand(51)+50;
        health=rand(21)+80;
        smarts=rand(101);
        looks=rand(101);
        update();

})