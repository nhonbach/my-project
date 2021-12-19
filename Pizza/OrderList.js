"use strict";
        /*** REGION 1 - Global variables - Vùng khai báo biến, hằng số, tham số TOÀN CỤC */   
        var gPerson = {
                persons: [],
                filterData: function(paramFilterObj){
                    var vResultFilter = this.persons.filter(function(paramUser){
                        return ((paramFilterObj.orderStatus.toUpperCase() === paramUser.trangThai.toUpperCase() || paramFilterObj.orderStatus === "") &&
                            (paramFilterObj.loaiPizza === paramUser.loaiPizza || paramFilterObj.loaiPizza === ""))
                    });
                    return vResultFilter;
                }
        };

        const gNAME_COL = ['orderId','kichCo','loaiPizza','idLoaiNuocUong','thanhTien','hoTen','soDienThoai','trangThai','action'];
        const gCOL_ID = 0;
        const gCOL_PIZZASIZE = 1;
        const gCOL_PIZZATYPE = 2;
        const gCOL_DRINK = 3;
        const gCOL_PRICE = 4;
        const gCOL_FULLNAME = 5;
        const gCOL_PHONE = 6;
        const gCOL_STATUS = 7;
        const gCOL_ACTION = 8;

        var gOrderTable = $("#table-order").DataTable({
            ordering: false,
            columns: [
                {data: gNAME_COL[gCOL_ID]},
                {data: gNAME_COL[gCOL_PIZZASIZE]},
                {data: gNAME_COL[gCOL_PIZZATYPE]},
                {data: gNAME_COL[gCOL_DRINK]},
                {data: gNAME_COL[gCOL_PRICE]},
                {data: gNAME_COL[gCOL_FULLNAME]},
                {data: gNAME_COL[gCOL_PHONE]},
                {data: gNAME_COL[gCOL_STATUS]},
                {data: gNAME_COL[gCOL_ACTION]},
            ],
            columnDefs: [
                {
                    targets: gCOL_ACTION,
                    defaultContent: `<div class='row'>
                        <div class='col-md-6'><button class='form-control info-order btn btn-warning' id='btn-edit'><i class='fas fa-edit'></i></button>
                        </div>
                        <div class='col-md-6'><button class='form-control info-order btn btn-danger' id='btn-delete'><i class='fas fa-trash-alt'></i></button>
                        </div>                  
                    </div>`
                },
                {
                    targets: [gCOL_ID,gCOL_PIZZASIZE,gCOL_PIZZATYPE,gCOL_DRINK,gCOL_PRICE,gCOL_FULLNAME,gCOL_PHONE,gCOL_STATUS,gCOL_ACTION],
                    className: "text-center"
                },
                {
                    targets: [gCOL_ID,gCOL_PIZZASIZE,gCOL_PIZZATYPE,gCOL_DRINK,gCOL_PRICE,gCOL_FULLNAME,gCOL_PHONE,gCOL_STATUS],
                    sWidth: "90px"
                }
            ]
        });
        //khai báo giá trị pizza
        const gPizzaTypeS = {kichCo: "S",duongKinh: 20,suon: 2,salad: 200,soLuongNuoc: 2,thanhTien: 150000};
        const gPizzaTypeM = {kichCo: "M",duongKinh: 25,suon: 4,salad: 300,soLuongNuoc: 3,thanhTien: 200000};
        const gPizzaTypeL = {kichCo: "L",duongKinh: 30,suon: 8,salad: 500,soLuongNuoc: 4,thanhTien: 250000};
        const gPizzaType = [gPizzaTypeS,gPizzaTypeM,gPizzaTypeL];
        let gSelectPizza = "S";

        var gPriceElement = 0; //giá thực trả sau khi giảm giá
        var gDiscountElement = 0; //giá discount
        var gSalePercent = 0; //phần trăm giảm giá

        var gOrderId = "";
        var gId = "";
        var gPizzaSize = ["S","M","L"];

        var gFORM_MODE_NORMAL = "Normal";
        var gFORM_MODE_INSERT = "Insert";
        var gFORM_MODE_UPDATE = "Update";
        var gFormMode = gFORM_MODE_NORMAL;

        var gOrder = {
            kichCo: "",    // S, M, L
            duongKinh: 0,
            suon: 0,
            salad: 0,
            giamGia: 0,
            thanhTien: 0,
            idLoaiNuocUong:"",
            soLuongNuoc:"",
            hoTen: "",
            email: "",
            soDienThoai: "",
            diaChi: "",
            loiNhan: "",
            idVourcher:"",
            loaiPizza:"",
            id:"",
            orderId:""
        }
        /*** REGION 2 - Vùng gán / thực thi sự kiện cho các elements */
        onPageLoading();

        $("#btn-filter").on("click",function(){
            onBtnFilterDataClick();
        });
        $("#btn-insert-order").on("click",function(){
            onBtnCreateNewOrderClick();
        });
        $("#btn-confirm").on("click",function(){
            onBtnConfirmNewOrderClick();
        });
        
        $("#select-pizzasize").change(function(){
            getInForPizza(gPizzaType);
        });

        $(document).on("click","#btn-edit",function(){
            onBtnDetailClick(this);
        })
        $(document).on("click","#btn-confirm-order",function(){
            onBtnUpdateOrderClick();
        })
        $(document).on("click","#btn-delete",function(){
            onBtnDeleteClick(this);
        })

        $(document).on("click","#btn-confirm-delete",function(){
            onBtnConfirmDeleteClick();
        })
        /*** REGION 3 - Event handlers - Vùng khai báo các hàm xử lý sự kiện */
        // Hàm thực hiện khi load trang
        function onPageLoading() {
            loadAllOrderAjax();
            getDrinkListAjaxClick();
            getPizzaSizeList(gPizzaSize);
        }

        // hàm thực hiện khi tạo new order
        function onBtnCreateNewOrderClick(){
            "use strict";
            resetForm();
            gFormMode === gFORM_MODE_INSERT
            $("#detail-modal").modal("show");
            getInForPizza(gPizzaType);
        }

        //hàm kiểm tra ấn nút icon delete
        function onBtnDeleteClick(paramElement){
            "use strict";
            var vRowSelected = $(paramElement).closest("tr");
            var vTable = $("#table-order").DataTable();
            var vDataRow = vTable.row(vRowSelected).data();
            gId = vDataRow.id;
            $("#delete-modal").modal("show");
        }

        //hàm kiểm tra ấn nút xác nhận delete
        function onBtnConfirmDeleteClick(){
            "use strict";
            $.ajax({
                url: "http://42.115.221.44:8080/devcamp-pizza365/orders/" + gId,
                type: "DELETE",
                datatype: "json",
                success: function(res){
                    location.reload();
                },
                error: function(ajaxContent){
                    alert("Mã Vourcher không tồn tại");
                }
            })
        }

        //update một order mới
        function onBtnUpdateOrderClick() {
            "use strict";
            let vObjectRequest = {
                trangThai: $("#select-status").val() //3 trang thai open, confirmed, cancel
            };

            $.ajax({
                url: "http://42.115.221.44:8080/devcamp-pizza365/orders/" + gId,
                contentType: "application/json;charset=UTF-8",
                type : "PUT",
                dataType : "json",
                data: JSON.stringify(vObjectRequest),
                success: function(res){
                    location.reload();
                },
                error: function (ajaxContext){
                    alert(ajaxContext.responseText);
                }
            });
        }
 
        /*** REGION 4 - Common funtions - Vùng khai báo hàm dùng chung trong toàn bộ chương trình*/
        // Hàm thực hiện việc load all orders từ server và load vào table
        function loadAllOrderAjax(){
            "use strict";
            $.ajax({
                url: "http://42.115.221.44:8080/devcamp-pizza365/orders",
                type: "GET",
                dataType: "json",
                success: function(res) {
                    gPerson.persons = res;
                    loadOrderToTable(res);
                },
                error: function (ajaxContext) {
                    console(ajaxContext.responseText)
                }
            });
        }

        // input: xml http request đã đươc trả lời
        // ouptut/end: dữ liệu hiên thi trên bảng
        function loadOrderToTable(paramObject) {
            "use strict";
            gOrderTable.clear();
            gOrderTable.rows.add(paramObject);
            gOrderTable.draw();
        }
        
        //hàm filter data
        function onBtnFilterDataClick(){
            "use-strict";
            let vDataFilter = {
                orderStatus: "",
                loaiPizza:""
            }
            getDataFormFilter(vDataFilter);
            console.log(vDataFilter);
            let vResult = gPerson.filterData(vDataFilter);
            loadOrderToTable(vResult);
        }

        //hàm thu thập dữ liệu form
        function getDataFormFilter(paramObject){
            "use strict";
            paramObject.orderStatus = $("#sel-status").val();
            paramObject.loaiPizza = $("#sel-pizza").val();
        }

        //hàm xử lý khi ấn nút chi tiết
        function onBtnDetailClick(paramElement){
            "use strict";
            resetForm();
            gFormMode = gFORM_MODE_UPDATE;
            if(gFormMode === gFORM_MODE_UPDATE){
                $("#select-status").removeAttr("disabled", "disabled");
                $("#select-pizzatype").attr("disabled", "disabled");
                $("#select-pizzasize").attr("disabled", "disabled");
                $("#select-drink").attr("disabled", "disabled");
                $("#input-idvoucher").attr("disabled", "disabled");
                $("#input-fullname").attr("disabled", "disabled");
                $("#input-email").attr("disabled", "disabled");
                $("#input-phone").attr("disabled", "disabled");
                $("#input-address").attr("disabled", "disabled");
                $("#input-message").attr("disabled", "disabled");
                var vRowSelected = $(paramElement).closest("tr");
                var vTable = $("#table-order").DataTable();
                var vDataRow = vTable.row(vRowSelected).data();
                gId = vDataRow.id;
                gOrderId = vDataRow.orderId;
                getAjaxDetailOrder(gOrderId);
                $("#btn-confirm").attr("id","btn-confirm-order");
                $("#detail-modal").modal("show");
            }
        }

        //hàm gọi api order theo orderid
        function getAjaxDetailOrder(paramOrderId){
            "use strict";
            $.ajax({
                url: "http://42.115.221.44:8080/devcamp-pizza365/orders/" + paramOrderId,
                dataType: "json",
                type: "GET",
                success: function(res){
                    handleOrderDetail(res);
                    console.log(res);
                },
                error: function(ajaxContext){
                    alert(ajaxContext.responseText);
                }
            })
        }

        //hàm xử lý response check voucher id
        function handleCheckVoucherId(paramResponse){
            "use strict";
            gSalePercent = parseInt(paramResponse.phanTramGiamGia);
            gDiscountElement = gPriceElement * (gSalePercent/100);
            $("#input-giamgia").val(gDiscountElement);
            $("#input-thanhtien").val(gPriceElement);
        }

        //hàm đổ data vào modal
        function handleOrderDetail(paramResponse){
            "use strict";
            $("#input-orderid").val(paramResponse.orderId);
            $("#select-pizzasize").val(paramResponse.kichCo);
            $("#input-duongkinh").val(paramResponse.duongKinh);
            $("#input-suon").val(paramResponse.suon);
            $("#input-salad").val(paramResponse.salad);
            $("#select-pizzatype").val(paramResponse.loaiPizza);
            $("#input-idvoucher").val(paramResponse.idVourcher);
            $("#input-thanhtien").val(paramResponse.thanhTien);
            $("#input-giamgia").val(paramResponse.giamGia);
            $("#select-drink").val(paramResponse.idLoaiNuocUong);
            $("#input-soluongdrink").val(paramResponse.soLuongNuoc);
            $("#input-fullname").val(paramResponse.hoTen);
            $("#input-email").val(paramResponse.email);
            $("#input-phone").val(paramResponse.soDienThoai);
            $("#input-address").val(paramResponse.diaChi);
            $("#input-message").val(paramResponse.loiNhan);
            $("#select-status").val(paramResponse.trangThai);
        }
        
        //hàm gọi api select drink
        function getDrinkListAjaxClick() {
            "use strict";
            $.ajax({
                url: "http://42.115.221.44:8080/devcamp-pizza365/drinks",
                dataType: "json",
                type: "GET",
                success: function(res){
                    handleDrinkList(res);
                },
                error: function(ajaxContext){
                    alert(ajaxContext.responseText);
                }
            });
        }

        //hàm tạo option cho select đồ uống
        function handleDrinkList(paramDrink){
            "use strict";
            $.each(paramDrink,function(i,item){
                $("#select-drink").append($('<option>',{
                    text: item.tenNuocUong,
                    value: item.maNuocUong
                }))
            })
        }

        //hàm tạo option cho select pizza size
        function getPizzaSizeList(paramPizza){
            "use strict";
            $.each(paramPizza,function(i,item){
                $("#select-pizzasize").append($('<option>',{
                    text: item,
                    value: item.toUpperCase()
                }))
            })
        }

        // hàm render thông tin theo pizza size
        function getInForPizza(paramObject){
            "use strict";
            $("#input-idvoucher").val("");
            $("#input-giamgia").val("");
            gSelectPizza = $("#select-pizzasize").val();
            for(let bI = 0; bI < paramObject.length; bI++){
                if(paramObject[bI].kichCo == gSelectPizza){
                    $("#input-duongkinh").val(paramObject[bI].duongKinh);
                    $("#input-soluongdrink").val(paramObject[bI].soLuongNuoc);
                    $("#input-suon").val(paramObject[bI].suon);
                    $("#input-salad").val(paramObject[bI].salad);
                    $("#input-thanhtien").val(paramObject[bI].thanhTien);
                    gPriceElement = paramObject[bI].thanhTien;
                }
            }            
        }

        //hàm confirm order
        function onBtnConfirmNewOrderClick(){
            "use strict";
            if(gFormMode === gFORM_MODE_NORMAL){
                getFormData(gOrder);
                console.log(gOrder);
                let vIsValidate = validateData(gOrder);
                getCheckVoucherIdClick();
                if(vIsValidate === true ){

                    sendRequestCreateNewOrder(gOrder);
                }
            }
        }        

        //hàm kiểm tra voucher id
        function getCheckVoucherIdClick(){
            "use strict";
            let vVoucherId = $("#input-idvoucher").val();
            if(vVoucherId !== ""){
                $.ajax({
                    url: "http://42.115.221.44:8080/devcamp-voucher-api/voucher_detail/" + vVoucherId,
                    type: "GET",
                    datatype: "json",
                    success: function(res){
                        handleCheckVoucherId(res);
                    },
                    error: function(ajaxContent){
                        alert("Mã Vourcher không tồn tại");
                    }
                })
            }

        }

        //thu thập dữ liệu
        function getFormData(paramPerson) {    
            "use strict";
            //gán giá trị cho đối tượng 
            paramPerson.kichCo = gSelectPizza;
            paramPerson.duongKinh = parseInt($("#input-duongkinh").val());
            paramPerson.suon = parseInt($("#input-suon").val());
            paramPerson.salad = parseInt($("#input-salad").val());
            paramPerson.giamGia = gDiscountElement;
            paramPerson.thanhTien = gPriceElement;
            paramPerson.idLoaiNuocUong = $("#select-drink").val();
            paramPerson.soLuongNuoc = parseInt($("#input-soluongdrink").val());
            paramPerson.hoTen = $("#input-fullname").val().trim();
            paramPerson.email = $("#input-email").val().trim();
            paramPerson.soDienThoai = $("#input-phone").val().trim();
            paramPerson.diaChi = $("#input-address").val().trim();
            paramPerson.loiNhan = $("#input-message").val().trim();
            paramPerson.idVourcher = parseInt($("#input-idvoucher").val().trim());
            paramPerson.loaiPizza = $("#select-pizzatype").val();
        }

         //hàm kiểm tra dữ liệu nhập trên form
        function validateData(paramPerson) {
            "use strict";
            let vEmailCheck = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/; 
            if (paramPerson.idLoaiNuocUong === "") {
                alert("Vui lòng chọn đồ uống");
                return false;
            }

            if (paramPerson.hoTen === "") {
                alert("Xin nhập tên");
                return false;
            }

            if (!vEmailCheck.test(paramPerson.email)) {
                alert("Email không hợp lệ");
                return false;
            }

            if (isNaN(paramPerson.soDienThoai)) {
                alert("Điện thoại không hợp lệ");
                return false;
            }

            if (paramPerson.diaChi === "") {
                alert("Xin nhập vào địa chỉ");
                return false;
            }
            return true;
        }

        //hàm tạo order mới
        function sendRequestCreateNewOrder(paramPerson){
            "use strict";
            $.ajax({
                url: "http://42.115.221.44:8080/devcamp-pizza365/orders",
                type: "POST",
                dataType: "json",
                contentType: "application/json;charset=UTF-8",
                data: JSON.stringify(paramPerson),
                success: function(res){
                    $("#detail-modal").modal("hide");
                    location.reload();
                },
                error: function(ajaxContent){
                    alert(ajaxContent);    
                }
            })
        }

        //hàm reset form data
        function resetForm(){
            "use strict";
            gFormMode = gFORM_MODE_NORMAL;
            gOrderId = "";
            gId = "";
            $("#btn-confirm-order").html("Lưu dữ liệu").attr("id","btn-confirm");
            $("#select-pizzatype").removeAttr("disabled", "disabled");
            $("#select-pizzasize").removeAttr("disabled", "disabled");
            $("#select-drink").removeAttr("disabled", "disabled");
            $("#input-idvoucher").removeAttr("disabled", "disabled");
            $("#input-fullname").removeAttr("disabled", "disabled");
            $("#input-email").removeAttr("disabled", "disabled");
            $("#input-phone").removeAttr("disabled", "disabled");
            $("#input-address").removeAttr("disabled", "disabled");
            $("#input-message").removeAttr("disabled", "disabled");
            $("#select-status").attr("disabled", "disabled");
            $("#select-status").val("");
            $("#input-orderid").val("");
            $("#input-duongkinh").val("");;
            $("#input-suon").val("");;
            $("#input-salad").val("");
            $("#input-pizzatype").val("");
            $("#input-idvoucher").val("");
            $("#input-giamgia").val("");
            $("#input-thanhtien").val("");
            $("#select-pizzasize").val("S");
            $("#select-drink").val("TRATAC");
            $("#input-soluongdrink").val("");
            $("#input-fullname").val("");
            $("#input-email").val("");
            $("#input-phone").val("");
            $("#input-address").val("");
            $("#input-message").val("");
        }
        