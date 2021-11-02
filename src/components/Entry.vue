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
        <v-btn v-if="item.Files !== ''" color="info" @click="Download(item)" text><v-icon>mdi-download</v-icon></v-btn>
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
          v-model="entry.Organ"
          label="Организация"
          :error-messages="allErrors('entry','Organ')"
          @change="$v.entry.Organ.$touch()"
          @blur="$v.entry.Organ.$touch()"
        >
        ></v-select>
        <v-text-field
          v-model="entry.Address"
          label="Адресат"
          :error-messages="allErrors('entry','Address')"
          @change="$v.entry.Address.$touch()"
          @blur="$v.entry.Address.$touch()"
        >
        ></v-text-field>
        <v-text-field
          v-model="entry.Content"
          label="Содержание"
          :error-messages="allErrors('entry','Content')"
          @input="$v.entry.Content.$touch()"
          @blur="$v.entry.Content.$touch()"
        >
        ></v-text-field>
        <v-text-field
          v-model="entry.Sender"
          label="Отправитель"
          :error-messages="allErrors('entry','Sender')"
          @input="$v.entry.Sender.$touch()"
          @blur="$v.entry.Sender.$touch()"
        >
        ></v-text-field>
        <v-select
          :items="way"
          v-model="entry.Wey"
          label="Способ отправки"
          :error-messages="allErrors('entry','Wey')"
          @change="$v.entry.Wey.$touch()"
          @blur="$v.entry.Wey.$touch()"
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
        <v-btn color="deep-orange accent-4" dark @click="dialog=false, entry={}, file='', $v.$reset()">Отмена</v-btn>
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
      file: '',
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
      entry:{},
    }
  },
  validations: {
    file: {required},
    entry: {Organ: {required},
            Address: {required},
            Content: {required},
            Sender: {required},
            Wey: {required}
    },
  },
  mounted() {
      this.getEntry()   
  },
  methods: {
    Download(item) {
      axios({
        url: 'http://192.168.0.75:8000/entry/file/' + item.id,
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
      if (this.$v.$invalid) {
        return
      }
      this.dialog=false
      let formData = new FormData();
      formData.append('file',this.file)
      formData.append('Organ', this.entry.Organ)
      formData.append('Address', this.entry.Address)
      formData.append('Content', this.entry.Content)
      formData.append('Sender', this.entry.Sender)
      formData.append('Wey', this.entry.Wey)
      await axios.post('http://192.168.0.75:8000/entry/file',formData,{headers: {'Content-Type': 'multipart/form-data'}})
      .then(response => {
        this.getEntry(),
        this.entry={},
        this.file=''
        this.$v.$reset()
      })
      
    },
    getEntry() {
      axios.get('http://192.168.0.75:8000/entry')
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
