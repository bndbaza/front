<template>
  <v-container grid-list-xs>
    <v-data-table
      :headers="headers"
      :items="items"
      :search="search"
      :items-per-page="15"
      :sort-by="['Date']"
      :sort-desc="[true]"
    >
      <template v-slot:[`item.Date`]="{ item }">
        <template>{{ item.Date | date }}</template>
      </template>
      <template v-slot:[`item.Files`]="{ item }">
        <v-btn v-if="item.Files !== ''" color="info" @click="Download(item)" text><v-icon>mdi-download</v-icon></v-btn>
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
          v-model="contract.We"
          label="Наша Организация"
          :error-messages="allErrors('contract','We')"
          @change="$v.contract.We.$touch()"
          @blur="$v.contract.We.$touch()"
        >
        ></v-select>
        <v-text-field
          v-model="contract.NumCont"
          label="№ Договора"
        >
        ></v-text-field>
        <v-text-field
          v-model="contract.They"
          label="Организация"
          :error-messages="allErrors('contract','They')"
          @input="$v.contract.They.$touch()"
          @blur="$v.contract.They.$touch()"
        >
        ></v-text-field>
        <v-select
          :items="view"
          v-model="contract.View"
          label="Вид договора"
          :error-messages="allErrors('contract','View')"
          @input="$v.contract.View.$touch()"
          @blur="$v.contract.View.$touch()"
        >
        >
        ></v-select>
        <v-text-field
          v-model="contract.Thing"
          label="Предмет договора"
          :error-messages="allErrors('contract','Thing')"
          @input="$v.contract.Thing.$touch()"
          @blur="$v.contract.Thing.$touch()"
        >
        ></v-text-field>
        <v-text-field
          v-model="contract.Date"
          label="Дата договора"
          :error-messages="requiredalphaErrors('contract','Date')"
          @input="$v.contract.Date.$touch()"
          @blur="$v.contract.Date.$touch()"
        >
        ></v-text-field>
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
  </v-container>
  
</template>

<script>
import axios from 'axios'
import { required, helpers } from 'vuelidate/lib/validators'
const alpha = helpers.regex('alpha', /^[0-3][0-9]\.[0-1][0-9]\.[2][0][2-9][0-9]$/)
export default {
  props: ['search'],
  data() {
    return {
      items: [],
      dialog: false,
      file: '',
      organ: ['ООО Байкальский завод металлоконструкций','ООО Байкалстальстрой 2015'],
      view: ['Аренда','Купли-продажи','Хранения','Подряда','Изготовление металлоконструкций','Поставки','Оказания услуг'],
      contract: {},
      headers: [
        { text: '№ Договора', value: 'NumCont' },
        { text: 'Дата', value: 'Date' },
        { text: 'Наша Организация', value: 'We' },
        { text: 'Организация', value: 'They' },
        { text: 'Вид договора', value: 'View' },
        { text: 'Предмет договора', value: 'Thing' },
        { text: 'Файлы', value: 'Files' },
      ],
    }
  },
  validations: {
    file: {required},
    contract: {We: {required},
            Date: {required, alpha},
            They: {required},
            View: {required},
            Thing: {required}
    },
  },
  mounted() {
      this.getContract()   
  },
  methods: {
    Download(item) {
      axios({
        url: 'http://192.168.0.75:8000/contract/file/' + item.id,
        method: 'GET',
        responseType: 'blob',
      }).then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', item.NumCont +'.'+ (item.Files).split('.').pop());
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
      formData.append('We', this.contract.We)
      formData.append('Date', this.contract.Date)
      formData.append('NumCont', this.contract.NumCont)
      formData.append('They', this.contract.They)
      formData.append('View', this.contract.View)
      formData.append('Thing', this.contract.Thing)
      await axios.post('http://192.168.0.75:8000/contract/file',formData,{headers: {'Content-Type': 'multipart/form-data'}})
      .then(response => {
        this.getContract(),
        this.contract={},
        this.file=''
        this.$v.$reset()
      })
    },  
    getContract() {
      axios.get('http://192.168.0.75:8000/contract')
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
    requiredalphaErrors (pol1,pol2) {
      const errors = []
      if (!this.$v[pol1][pol2].$dirty) return errors
      !this.$v[pol1][pol2].alpha && errors.push('Неверный формат даты! Пример 01.01.2021')
      !this.$v[pol1][pol2].required && errors.push('Поле не должно быть пустым')
      return errors
    },
  },
}
</script>