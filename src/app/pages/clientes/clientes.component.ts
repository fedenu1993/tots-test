import { Component, ViewChild } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { TotsListResponse, TotsQuery } from '@tots/core';
import { MoreMenuColumnComponent, StringColumnComponent, TotsActionTable, TotsColumn, TotsTableComponent, TotsTableConfig } from '@tots/table';
import { StringFieldComponent, TotsFormModalService, TotsModalConfig, TotsActionModalForm, SubmitAndCancelButtonsFieldComponent } from '@tots/form';
import { delay, lastValueFrom, of, tap } from 'rxjs';
import { ClientService } from 'src/app/services/client.service';
import { Client } from 'src/app/entities/client';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent {
  @ViewChild('tableComp') tableComp!: TotsTableComponent;
  config = new TotsTableConfig();

  private id = 0;

  items: Client[] = [];

  item = new Client();

  constructor(
    protected modalService: TotsFormModalService,
    private clientService: ClientService,
    private toastr: ToastrService
  ) { }

  async ngOnInit() {
    await this.loadTable();
  }

  async loadClients() {
    const response = await lastValueFrom(this.clientService.list());
    this.items = response.data;
    let data = new TotsListResponse();
    data = response;
    return data;
  }

  async onOrder(column: TotsColumn) {
    let response = await this.loadClients();
    if (column.order == 'asc') {
      response.data = this.items.sort((a, b) => (a.email > b.email) ? 1 : ((b.email > a.email) ? -1 : 0))
    } else {
      response.data = this.items.sort((a, b) => (a.email < b.email) ? 1 : ((b.email < a.email) ? -1 : 0))
    }
    this.config.obs = of(response);
    this.tableComp.loadItems();
  }

  onTableAction(action: TotsActionTable) {
    if (action.key == 'click-order') {
      this.onOrder(action.item);
    } else if (action.key == "remove") {
      this.item = action.item;
      this.removeItem(action.item);
    } else if (action.key == "edit") {
      this.editItem(action.item);
    }
  }

  // Configurar aca
  async loadTable() {
    this.config.id = 'table-test';
    this.config.columns = [
      // { key: 'check', component: CheckboxColumnComponent, title: '', },
      { key: 'firstname', component: StringColumnComponent, title: 'Nombre', field_key: 'firstname', hasOrder: false, extra: {} },
      { key: 'lastname', component: StringColumnComponent, title: 'Apellido', field_key: 'lastname', hasOrder: false, extra: {} },
      { key: 'email', component: StringColumnComponent, title: 'Email', field_key: 'email', hasOrder: true, extra: {} },
      {
        key: 'more', component: MoreMenuColumnComponent, title: '', extra: {
          stickyEnd: true, width: '60px', actions: [
            { icon: 'add', title: 'Editar', key: 'edit' },
            { icon: 'delete', title: 'Eliminar', key: 'remove' },
          ]
        }
      }
    ];
    let data = await this.loadClients();
    data.data = this.items;
    data.per_page = 5;
    this.config.obs = of(data).pipe(delay(1000));
    this.tableComp.loadItems();
  }

  addItem() {
    this.item = new Client();
    this.onClickOpenModal();
  }

  async editItem(clientData: Client = new Client()) {

    // En caso de edicion me aseguro que sea la version del backend la que voy a mostrar
    // Y asi evitar diferencias entre versiones
    if (clientData.id) {
      try {
        const res: any = await lastValueFrom(this.clientService.fetchById(clientData.id));
        clientData = res.response;
      } catch (error) {
        console.error('Error al obtener cliente', error);
      }
    }
    this.item = clientData;
    this.onClickOpenModal();

  }

  async removeItem(item: any) {

    let config = new TotsModalConfig();
    config.title = `Eliminar Cliente`;
    config.autoSave = false;
    config.item = this.item;
    config.fields = [
      { key: 'submit', component: SubmitAndCancelButtonsFieldComponent, label: 'Confirmar', validators: [Validators.required], extra: {} }
    ];
    this.modalService.open(config)
      .pipe(tap(action => {
        if (action.key == 'submit') {
          action.modal?.componentInstance.showLoading();
        }
      }))
      .pipe(tap(action => action ?? delay(2000)))
      .pipe(tap(action => {
        action.modal?.componentInstance.hideLoading()
      }))
      .subscribe(action => {
        if (action.key == 'submit') {
          this.clientService.removeById(this.item.id).subscribe(async (res: any) => {
            console.log('eliminando', res)
            await this.onClickOpenModalAfter(action, res);
          })
        } else if (action.key == 'cancel') {
          action.modal?.close()
        }
      });

  }

  private async changePage(pageEvent: PageEvent) {
    let data = await this.loadClients();
    data.data = [...this.items];
    // data.total = 50;
    this.config.obs = of(data).pipe(delay(2000));
    this.tableComp.loadItems();
  }

  click() {
    this.toastr.success('Cliente guardado con éxito!', 'Éxito');
  }

  onClickOpenModal() {
    let config = new TotsModalConfig();
    config.title = `${this.item.id ? 'Editar' : 'Nuevo'} Cliente`;
    config.autoSave = false;
    config.item = this.item;
    config.fields = [
      // Campo string
      { key: 'firstname', component: StringFieldComponent, label: 'Nombre', validators: [Validators.required], extra: {} },
      { key: 'lastname', component: StringFieldComponent, label: 'Apellido', validators: [Validators.required], extra: {} },
      { key: 'email', component: StringFieldComponent, label: 'Email', validators: [Validators.required, Validators.email], extra: {} },
      { key: 'address', component: StringFieldComponent, label: 'Direccion', validators: [Validators.required], extra: {} },
      { key: 'submit', component: SubmitAndCancelButtonsFieldComponent, label: 'Guardar', validators: [Validators.required], extra: {} }
    ];
    this.modalService.open(config)
      .pipe(tap(action => {
        if (action.key == 'submit') {
          action.modal?.componentInstance.showLoading();
        }
      }))
      .pipe(tap(action => action ?? delay(2000)))
      .pipe(tap(action => {
        action.modal?.componentInstance.hideLoading()
      }))
      .subscribe(action => {
        if (action.key == 'submit') {
          if (this.item.id) {
            this.clientService.update(action.item).subscribe(async (res: any) => {
              await this.onClickOpenModalAfter(action, res);
            })
          } else {
            console.log('aca', this.item, action)
            this.clientService.create(action.item).subscribe(async (res: any) => {
              console.log(res)
              await this.onClickOpenModalAfter(action, res);
            })
          }
        } else if (action.key == 'cancel') {
          action.modal?.close()
        }
      });
  }

  async onClickOpenModalAfter(action: TotsActionModalForm, res: { response: any, success: boolean }) {
    if (res.success) {
      this.toastr.success('Cambio guardado!', 'Éxito');
      await this.loadTable();
    } else {
      this.toastr.error('Algo fallo', 'Error')
    }
    action.modal?.componentInstance.hideLoading()
    action.modal?.close();
  }





}
