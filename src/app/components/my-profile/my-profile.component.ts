import { Component, OnInit } from '@angular/core';
import {AppConst} from '../../constants/app-const';
import {UserService} from '../../services/user.service';
import {LoginService} from '../../services/login.service';
import {User} from '../../models/user';
import {Router} from '@angular/router';
import {PaymentService} from '../../services/payment.service';
import {UserPayment} from '../../models/user-payment';
import {UserBilling} from '../../models/user-billing';

@Component({
  selector: 'app-my-profile',
  templateUrl: './my-profile.component.html',
  styleUrls: ['./my-profile.component.css']
})
export class MyProfileComponent implements OnInit {

private serverPath = AppConst.serverPath;
private dataFetched = false;
private loginError:boolean;
private loggedIn:boolean;
private credential = {'username':'', 'password':''};

private user: User = new User();
private updateSuccess:boolean;
private newPassword:string;
private incorrectPassword:boolean;
private currentPassword:string;

private selectedProfileTab: number = 0;
private selectedBillingTab: number = 0;

private userPayment: UserPayment = new UserPayment();
private userBilling: UserBilling = new UserBilling();
private userPaymentList: UserPayment[] = [];
private defaultPaymentSet: boolean;
private defaultUserPaymentId: number;
private stateList: string[] = [];

  constructor(
    private loginService: LoginService,
    private userService: UserService,
    private paymentService: PaymentService,
    private router: Router
  ) { }

  selectedBillingChange(val: number){
    this.selectedBillingTab = val;
  }

  onUpdateUserInfo(){
    this.userService.updateUserInfo(this.user, this.newPassword, this.currentPassword).subscribe(
      res=>{
        console.log(res.text());
        this.updateSuccess=true;
      },error=>{
        console.log(error.text());
        let errorMessage=error.text();
        if(errorMessage==="Incorrect current password!")this.incorrectPassword=true;
      }
    );
  }





  onNewPayment(){
    this.paymentService.newPayment(this.userPayment).subscribe(
      res=>{
        this.getCurrentUser();
        this.selectedBillingTab = 0;
      }, err=>{
        console.log(err.text());
      }
    );
  }

  onUpdatePayment(payment: UserPayment){
    this.userPayment = payment;
    this.userBilling = payment.userBilling;
    this.selectedBillingTab = 1;
  }


  onRemovePayment(id:number){
    this.paymentService.removePayment(id).subscribe(
      res=>{
        this.getCurrentUser();
      }, err=>{
        console.log(err.text());
      }
    );
  }

  setDefaultPayment(){
    this.defaultPaymentSet=false;
    this.paymentService.setDefaultPayment(this.defaultUserPaymentId).subscribe(
      res=>{
        this.getCurrentUser();
        this.defaultPaymentSet=true;
        }, err=>{
        console.log(err.text());
      }
    );
  }

  getCurrentUser(){
    this.userService.getCurrentUser().subscribe(
      res=>{
      this.user = res.json();
      this.userPaymentList=this.user.userPaymentList;

      for(let index in this.userPaymentList){
        if(this.userPaymentList[index].defaultPayment){
          this.defaultUserPaymentId=this.userPaymentList[index].id;
          break;
        }
      }
      this.dataFetched=true;
      },err=>{
        console.log(err);
      }
    );
  }

  ngOnInit() {
    this.loginService.checkSession().subscribe(
      res => {
        this.loggedIn=true;
      },error=>{
        this.loggedIn=false;
        console.log("inactive session!");
        this.router.navigate(['/myAccount']);
      }
    );
    this.getCurrentUser();

    for(let s in AppConst.usStates){
      this.stateList.push(s);
    }

    this.userBilling.userBillingState="";
    this.userPayment.type="";
    this.userPayment.expiryMonth="";
    this.userPayment.expiryYear="";
    this.userPayment.userBilling = this.userBilling;
    this.defaultPaymentSet=false;
  }
}
