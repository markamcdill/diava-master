import { Injectable } from '@angular/core';
import { AdditionalVisitorDialog } from '../additional-visitor-dialog/additional-visitor-dialog'

@Injectable({
  providedIn: 'root'
})
export class AdditionalVisitorServiceService{

  _visitorList: AdditionalVisitorDialog[] = []

  constructor() { }


  addVisitor(visitor: AdditionalVisitorDialog) {
    visitor.ID = this._visitorList.length + 1;
    this._visitorList.push(visitor);
  }

  removeVisitor(add_visitor_key: number) {
    const visitor = this._visitorList.findIndex(c => c.ID == add_visitor_key);
    this._visitorList.splice(visitor, 1);
  }

  clearVisitorList(){
    this._visitorList = []
  }

  editContact(visitor: AdditionalVisitorDialog){
    const index = this._visitorList.findIndex(c => c.ID === visitor.ID);
    this._visitorList[index] = visitor;
  }

  deleteVisitor(id: number) {
    const visitor = this._visitorList.findIndex(c => c.ID === id);
    this._visitorList.splice(visitor, 1);
  }

  getAllVisitors() {
    return this._visitorList;
  }

  setVisitorList(visitorList){
    if (visitorList) {
      this._visitorList = visitorList
    }
  }

}
