import { Injectable } from '@angular/core';
import { HubResponse } from 'src/app/models/hubResponse';
import { Observable, Subject, ReplaySubject } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class HubSocketService {
  socket: WebSocket | undefined; /* '!' means default value */
  requestPromises = <any>[];
  promiseIdCounter = 0;

  public ConnectionId: string | undefined;

  private hubMessageStream = new ReplaySubject<any>(1);

  private disconnectStream = new Subject();

  get Connected(): boolean {
    return !!this.ConnectionId;
  }

  listenOn<T>(methodName: string): Observable<T> {
    return this.hubMessageStream.asObservable().pipe(
      filter(x => x.methodName == methodName),
      map(x => x.data as T)
    );
  }

  constructor(private router: Router) {
  }

  onDisconnect(): Observable<any> {
    return this.disconnectStream.asObservable();
  }

  doDisconnect() {
    this.socket?.close();
  }

  async doConnect(uri: string) {
    if (this.socket) {
      console.log("ALREADY CONNECTED - ABORTING");
      return new Promise((resolve, reject) => reject());
    }

    this.socket = new WebSocket(uri);
    this.socket.onclose = (e) => this.onClose(e);
    this.socket.onmessage = (e) => this.onMessage(e);
    return new Promise<void>((resolve, reject) => {
      (<WebSocket>this.socket).onopen = () => {
        resolve();
      };
      (<WebSocket>this.socket).onerror = e => {
        this.cleanupSocket();
        console.log(e);
        reject(e);
      }
    });
  }

  onClose(e: any) {
    console.log("Socket closed: ", e);
    this.cleanupSocket();
    this.disconnectStream.next(e);
  }

  private cleanupSocket() {
    this.ConnectionId = undefined;
    this.socket = undefined;
  }

  // RegisterClientMethod(methodName, callback) {
  //   this.hubMethods.push({ methodName: methodName, callback: callback });
  // }

  async sendWithPromise<T>(methodName: string, data: any | undefined): Promise<T> {
    if (!this.socket) {
      console.log("Socket is undefined! Cannot sendWithPromise");
      return new Promise<T>((resolve, reject) => reject());
    }

    let hubData = {
      methodName: methodName,
      data: data,
      promiseId: this.promiseIdCounter
    };

    let stringData = JSON.stringify(hubData);

    var promise = new Promise<T>((resolve, reject) => {
      this.requestPromises.push({ resolve: resolve, promiseId: hubData.promiseId });
      setTimeout(() => {
        reject("request timed out!")
      }, 3000);
    });

    this.socket.send(stringData);

    this.promiseIdCounter++;
    if (this.promiseIdCounter >= Number.MAX_VALUE) {
      this.promiseIdCounter = 0;
    }

    return promise;
  }

  send(methodName: string, data: any): void {
    if (!this.socket) {
      console.log('Socket is undefined! Cannot send()');
      return;
    }

    let hubData = {
      methodName: methodName,
      data: data,
      promiseId: this.promiseIdCounter
    };

    let stringData = JSON.stringify(hubData);

    this.socket.send(stringData);
  }

  async onMessage(e: any) {
    var hubData = JSON.parse(e.data);

    if (!hubData || (hubData.methodName == undefined && hubData.promiseId == undefined)) {
      console.log("Received corrupted hub data: ", e.data);
    }

    if (hubData && hubData.methodName === "HubSocketConnected") {
      this.ConnectionId = hubData.data;
      console.log("ConnectionId: ", this.ConnectionId);
      return;
    }

    if (hubData.promiseId != undefined && hubData.promiseId != -1) {
      var promise = this.requestPromises.find((x: any) => x.promiseId == hubData.promiseId);
      if (promise) {
        //console.log("Received Immediate Callback response! PromiseId: ", hubData.promiseId);
        promise.resolve(hubData.data);
        return;
      }
    } else {
      //var hubMethod = this.hubMethods.find(x => x.methodName == hubData.methodName);
      //if (hubMethod) {
      console.log("Received message with no explicit client origin", hubData);
      //await hubMethod.callback(hubData.data);
      this.hubMessageStream.next(hubData);
      return;
      //}
    }

    console.log("Received data, but no method is registered to listen for it! MethodName: " + hubData.methodName);
  }
}
