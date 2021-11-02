<template>
  <v-container grid-list-xs>
    <v-data-table
      dense
      :headers="headers"
      :items="items"
      :search="search"
      :items-per-page="15"
      :sort-by="['Date','RegNumber']"
      :sort-desc="[true, true]"
    >
      <template v-slot:[`item.Files`]="{ item }">
        <div class="">
          <v-btn small v-if="item.Files !== ''" color="info" icon @click="Download(item)" text><v-icon>mdi-download</v-icon></v-btn>
          <v-btn small color="green" icon @click="editItem(item)" text><v-icon>mdi-plus</v-icon></v-btn>
        </div>
      </template>
      <template v-slot:[`item.Date`]="{ item }">
        <template>{{ item.Date | date }}</template>
      </template>
    </v-data-table>
    <v-dialog v-model="dialog" persistent max-width="500px">
    <template v-slot:activator="{ on, attrs }">
      <v-btn color="purple darken-4" absolute right fab dark v-bind="attrs" v-on="on">
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </template>
    <v-card>
      <v-card-title primary-title>
        Добавление
      </v-card-title>
      <v-card-text>
        <v-select
          :items="organ"
          v-model="output.Organ"
          label="Организация"
          :error-messages="allErrors('output','Organ')"
          @change="$v.output.Organ.$touch()"
          @blur="$v.output.Organ.$touch()"
        >
        ></v-select>
        <v-text-field
          v-model="output.Address"
          label="Адресат"
          :error-messages="allErrors('output','Address')"
          @change="$v.output.Address.$touch()"
          @blur="$v.output.Address.$touch()"
        >
        ></v-text-field>
        <v-text-field
          v-model="output.Content"
          label="Содержание"
          :error-messages="allErrors('output','Content')"
          @input="$v.output.Content.$touch()"
          @blur="$v.output.Content.$touch()"
        >
        ></v-text-field>
        <v-select
          :items="way"
          v-model="output.Wey"
          label="Способ отправки"
          :error-messages="allErrors('output','Wey')"
          @change="$v.output.Wey.$touch()"
          @blur="$v.output.Wey.$touch()"
        >
        ></v-select>
        <v-file-input
          label="Файл"
          v-model="file"
          :error-messages="fileErrors('file')"
          @change="$v.file.$touch()"
          @blur="$v.file.$touch()"
        >
        </v-file-input>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="purple darken-4" dark @click="Upload()">OK</v-btn>
        <v-btn color="deep-orange accent-4" dark @click="dialog=false, output={}, file='', $v.$reset()">Отмена</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <v-dialog
    v-model="dialogEdit"
    persistent
    max-width="500px"
    transition="dialog-transition"
  >
    <v-card>
      <v-card-title primary-title>
        Добавить Файл
      </v-card-title>
      <v-card-text>
        <v-file-input
          label="Файл"
          v-model="fileUpdate"
          :error-messages="fileErrors('fileUpdate')"
          @change="$v.fileUpdate.$touch()"
          @blur="$v.fileUpdate.$touch()"
        >
        </v-file-input>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="purple darken-4" dark @click="UploadUpdate()">OK</v-btn>
        <v-btn color="deep-orange accent-4" dark @click="dialogEdit=false, updEdit= '', fileEdit='', $v.$reset()">Отмена</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  </v-container>
</template>

<script>
import axios from 'axios'
import { required } from 'vuelidate/lib/validators'
export default {
  props: ['search'],
  data() {
    return {
      dialog: false,
      dialogEdit: false,
      updEdit: '',
      file: '',
      fileUpdate: '',
      items: [],
      organ: ['ООО Байкальский завод металлоконструкций','ООО Байкалстальстрой 2015','ООО Байкалстальстрой'],
      way: ['Почта России без уведомления','Почта России с уведомлением', 'Электронная почта','Экспресс-почта','Лично'],
      headers: [
        { text: 'Рег.Номер', value: 'RegNumber' },
        { text: 'Дата', value: 'Date' },
        { text: 'Организация', value: 'Organ' },
        { text: 'Адресат', value: 'Address' },
        { text: 'Содержание', value: 'Content' },
        { text: 'Отправитель', value: 'Sender' },
        { text: 'Способ отправки', value: 'Wey' },
        { text: 'Файлы', value: 'Files' },
      ],
      output:{},
    }
  },
  validations: {
    file: {required},
    fileUpdate: {required},
    output: {Organ: {required},
            Address: {required},
            Content: {required},
            Wey: {required}
    },
  },
  mounted() {
      this.getOutput()   
  },
  methods: {
    Download(item) {
      axios({
        url: 'http://192.168.0.75:8000/output/file/' + item.id,
        method: 'GET',
        responseType: 'blob',
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', item.RegNumber +'.'+ (item.Files).split('.').pop());
        document.body.appendChild(link);
        link.click();
      });
    },
    async Upload() {
      this.$v.$touch()
      if (this.$v.file.$invalid && this.output.$invalid) {
        return
      }
      this.dialog=false
      let formData = new FormData();
      formData.append('file',this.file)
      formData.append('Organ', this.output.Organ)
      formData.append('Address', this.output.Address)
      formData.append('Content', this.output.Content)
      formData.append('Wey', this.output.Wey)
      await axios.post('http://192.168.0.75:8000/output/file',formData,{headers: {'Content-Type': 'multipart/form-data'}})
      .then(response => {
        this.getOutput(),
        this.output={},
        this.file=''
        this.$v.$reset()
      })
    },
    async UploadUpdate() {
      this.$v.$touch()
      if (this.$v.fileUpdate.$invalid) {
        return
      }
      this.dialogEdit=false
      let formData = new FormData()
      formData.append('file', this.fileUpdate)
      await axios.put('http://192.168.0.75:8000/output/files/put/'+this.updEdit,formData,{headers: {'Content-Type': 'multipart/form-data'}})
      .then(response => {
        this.getOutput(),
        this.updEdit='',
        this.fileUpdate='',
        this.$v.$reset()
      })
    },
    getOutput() {
      axios.get('http://192.168.0.75:8000/output')
      .then(response => this.items = response.data);
    },
    allErrors (pol1, pol2) {
      const errors = []
      if (!this.$v[pol1][pol2].$dirty) return errors
      !this.$v[pol1][pol2].required && errors.push('Не должен быть пустым')
      return errors
    },
    fileErrors (pol) {
      const errors = []
      if (!this.$v[pol].$dirty) return errors
      !this.$v[pol].required && errors.push('Не должен быть пустым')
      return errors
    },
    editItem (item) {
      this.dialogEdit = true
      this.updEdit = item.id
    },
  }
}
</script>

<style scoped>
  .v-btn--example {
    bottom: 0;
    position: absolute;
    margin: 0 0 16px 16px;
  }
</style>