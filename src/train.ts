//================================Task ZH==============================
//Masala:hunday function yozing, u berilgan array parametrni ichidagi eng katta raqamgacha tushib qolgan raqamlarni bir arrayda qaytarsin.

//Yechim:
function findDisappearedNumbers(list: number[]):number[]{
    let result = Math.max(...list)
    let result2:number[] = []
     for(let i=0; i<result; i++){
        if(!list.includes(i)){
        result2.push(i)
        }
     }   
    return result2
}
    console.log(findDisappearedNumbers([1, 3, 4, 7]))

//================================Task ZG==============================
//Masala:Shunday function yozing, u berilgan string parametrni snake casega otkazib qaytarsin.

//Yechim:
// function capitalizeWords(str: string): string {
//   return str.trim().toLowerCase().split(/\s+/).join('_');
// }
// console.log(capitalizeWords('name should be a string'))


//================================Task ZE==============================
//Masala:Shunday function yozing, uni string parametri bolsin. String ichidagi har bir sozni bosh harflarini katta harf qilib qaytarsin lekin 1 yoki 2 harfdan iborat sozlarni esa oz holicha qoldirsin.
// function capitalizeWords(text: string): any{
//     const result: string[] = text.split(' ')
//     let result2: string = result.map(ele => ele.length>2 ? ele[0].toUpperCase() + ele.slice(1) : ele).join(' ')
//     return result2
    
// }

// console.log(capitalizeWords('name should be a string'))

//Yechim:

//================================Task ZE==============================
//Masala:Shunday function yozing, uni  string parametri bolsin. String ichida takrorlangan harflarni olib tashlab qolganini qaytarsin

//Yechim:
// function removeDuplicate(text: string): string{
//     let result: string[] = text.split('')
//     let result2: string[] = []
//     for(let i = 0; i<result.length; i++){
//         if(!result2.includes(result[i])){
//             result2.push(result[i])
//     }
// }
//     return result2.join('')
// }

// console.log(removeDuplicate('string'))



//================================Task ZD==============================
//Masala:Shunday function yozing. Bu function o'ziga, parametr sifatida birinchi oddiy number, keyin yagona array va uchinchi bo'lib oddiy number qabul qilsin. Berilgan birinchi number parametr, arrayning tarkibida indeks bo'yicha hisoblanib, shu aniqlangan indeksni uchinchi number parametr bilan alashtirib, natija sifatida
//yangilangan arrayni qaytarsin.

//Yechim:
// function changeNumberInArray(
//   index: number,
//   arr: number[],
//   newValue: number
// ): number[] {
//   arr[index] = newValue;
//   return arr;
// }

// const result = changeNumberInArray(1, [1, 3, 7, 2], 2);

// console.log(result);


//================================Task ZC==============================
//Masala:Selisy (°C) shkalasi bo'yicha raqam qabul qilib, uni Ferenhayt (°F) shkalisaga o'zgaritib beradigan function yozing.

//Yechim:
// function celsiusToFahrenheit(celsius: number): number {
//   return celsius * 9 / 5 + 32;
// }
// console.log(celsiusToFahrenheit(0))


//================================Task ZB==============================
//Masala:Shunday function yozing, uni 2 ta number parametri bolsin va berilgan sonlar orasidan random raqam return qilsin

//Yechim:
// function randomBetween(num:number, num1:number):number {
//     return Math.floor(Math.random()*(num1-num+1))+num
// }
// console.log(randomBetween(30, 50))



//================================Task Z==============================
//Masala:Shunday function yozing. Bu function sonlardan iborat array qabul qilsin. Function'ning vazifasi array tarkibidagi juft sonlarni topib ularni yig'disini qaytarsin.

//Yechim:
// function sumEvens(list: number[]): number{
//     let count: number = 0
//     for(let i of list){
//         if (i%2 == 0) count += i
//     }
//     return count
// }
// console.log(sumEvens([1, 2, 3, 4, 8]))

//================================Task Y==============================
//Masala:Shunday function yozing, uni 2'ta array parametri bo'lsin.Bu function ikkala arrayda ham ishtirok etgan bir xil qiymatlarni yagona arrayga joylab qaytarsin.

//Yechim:
// function findIntersection(list: number[], list1: number[]): number[]{
//     let list2: number[] = list.filter(ele => list1.includes(ele) ? ele : null) 
//   return list2
// }

// console.log(findIntersection([1,2,3], [3,2,0]))

//================================Task x==============================
//Masala:Shunday function yozing, uni object va string parametrlari bo'lsin.Bu function, birinchi object parametri tarkibida, kalit sifatida ikkinchi string parametri necha marotaba takrorlanganlini sanab qaytarsin.

//Yechim:
// function countOccurrences(obj: any, str: string): number {
//   let count = 0;

//   for (let key in obj) {
//     if (key === str) {
//       count += 1;
//     }
//     const value = obj[key];
//     if (typeof value === "object" && value !== null) {
//       count += countOccurrences(value, str);
//     }
//   }

//   return count;
// }

// console.log(countOccurrences({model: 'Bugatti', steer: {model: 'HANKOOK', size: 30}}, 'model'))

//================================Task W==============================
//Masala:Shunday function yozing, u o'ziga parametr sifatida yagona array va number qabul qilsin. 
// Siz tuzgan function arrayni numberda berilgan uzunlikda kesib bo'laklarga ajratgan holatida qaytarsin.
//Yechim:
// function chunkArray(list: number[], num: number): number[][] {
//   let count: number[][] = []

//   let n = Math.ceil(list.length / num)

//   for (let i = 0; i < n; i++) {
//     count[i] = [] // har safar yangi bo‘lak ochamiz

//     for (let j = 0; j < num; j++) {
//       let index = i * num + j

//       if (index < list.length) {
//         count[i].push(list[index])
//       }
//     }
//   }

//   return count
// }

// console.log(chunkArray([1,2,3,4,5,6,7,8,9,10], 3))




//================================Task V==============================
//Masala:Shunday function yozing, uni string parametri bo'lsin.Va bu function stringdagi har bir harfni o'zi bilan necha marotaba taktorlanganligini ko'rsatuvchi object qaytarsin.


//Yechim:
// function countChars(text: string): Record<string, number> {
//   const result: Record<string, number> = {};

//   for (let char of text) {
//     if (result.char) {
//       result.char=+1;
//     } else {
//       result[char] = 1;
//     }
//   }
//   return result;
// }
// console.log(countChars("hello"))


//================================Task T==============================
//Masala:Shunday function tuzing, uni number parametri bo'lsin.Va bu function berilgan parametrgacha, 0'dan boshlab oraliqda nechta toq sonlar borligini aniqlab return qilsi.
//Yechim:
// function sumOdds(n: number):number {
//   let count:number[]=[]
//   for(let i=1;i<=n;i++){
//   if(i%2==1){
//        count.push(i) 
//     }
//   }
//   return count.length
// }
// console.log(sumOdds(9))

//================================Task T==============================
//Masala:Shunday function tuzing, u sonlardan tashkil topgan 2'ta array qabul qilsin Va ikkala arraydagi sonlarni tartiblab bir arrayda qaytarsin.
//Yechim:
// function mergeSortedArrays(list:number[], list1: number[]):number[] {
//   let list2 :number[]= list.concat(list1).sort()
//   let list3: number[]=[]
  
//   while(list2.length){
//     let n = (Math.min(...list2))
//     list3.push(n)
//     let m = list2.indexOf(n)
//     list2.splice(m,1)
//   }
//   return list3
// }

// console.log(mergeSortedArrays([0, 3, 4, 31,56], [4, 6, 30]))


//================================Task S==============================
//Masala:Shunday function yozing, u numberlardan tashkil topgan array qabul qilsin va osha numberlar orasidagi tushib qolgan sonni topib uni return qilsin
//Yechim:
// function missingNumber(list: number[]){
//   let count = 0;
//   let list2: number[] = []
//   for(let i of list){
//     if(list[i]>count){
//       count = list[i]
//     }
//   }
//   for(let ele=0;ele<count;ele++){
//     if(!list.includes(ele)){
//       list2.push(ele)
//     }
//   }
//   return list2
//   } 

// console.log(missingNumber([6, 0, 1]))



//================================Task R==============================
//Masala:Shunday function yozing, u string parametrga ega bo'lsin.Agar argument sifatida berilayotgan string, "1 + 2" bo'lsa,string ichidagi sonlarin yig'indisni hisoblab, number holatida qaytarsin
//Yechim:
// function calculate(str: string): any {
//   const parts = str.split(" ");
//   const num1 = Number(parts[0]);
//   const operator = parts[1];
//   const num2 = Number(parts[2]);
  
//   switch (operator) {
//     case "+":
//       return num1 + num2;

//     case "-":
//       return num1 - num2;

//     case "*":
//       return num1 * num2;

//     case "/":
//       return num2 !== 0 ? num1 / num2 : NaN;

//   }
// }

// console.log(calculate("1 + 3"))

//================================Task Q==============================
//Masala:Shunday function yozing, u 2 ta parametrga ega bo'lib birinchisi object, ikkinchisi string bo'lsin. Agar qabul qilinayotgan ikkinchi string, objectning biror bir propertysiga mos kelsa, 'true', aks holda mos kelmasa 'false' qaytarsin.
//Yechim:
// function hasProperty(list:object, text:string) {
//   for(let value in list){
//      if(value == text) return true;
// }
// return false 
// }

// console.log(hasProperty({ name: "BMW", model: "M3" }, "model"));

//================================Task P==============================
//Masala:Parametr sifatida yagona object qabul qiladigan function yozing.Qabul qilingan objectni nested array sifatida convert qilib qaytarsin
//Yechim:
// function objectToArray<T extends object>(
//   obj: T
// ): [keyof T, T[keyof T]][] {
//   const result: [keyof T, T[keyof T]][] = [];

//   for (const key in obj) {
//     if (Object.prototype.hasOwnProperty.call(obj, key)) {
//       result.push([key as keyof T, obj[key]]);
//     }
//   }

//   return result;
// }
// console.log(objectToArray( {a: 10, b: 20}))



//================================Task O==============================
//Masala:Shunday function yozing va u har xil qiymatlardan iborat array qabul qilsin.Va array ichidagi sonlar yig'indisini hisoblab chiqgan javobni qaytarsin
//Yechim:
// function calculateSumOfNumbers(list: any[]): number {
//   return list.reduce((sum, ele) => {
//     if (typeof ele === "number") {
//       return sum + ele;
//     }
//     return sum;
//   }, 0);
// }

// console.log(calculateSumOfNumbers([10, "10", {son: 10}, true, 35]))


//================================Task N==============================
//Masala:Shunday function yozing, u string qabul qilsin va string palindrom yani togri oqilganda ham, orqasidan oqilganda ham bir hil oqiladigan soz ekanligini aniqlab boolean qiymat qaytarsin
//Yechim:

// function palindromCheck(list: string): boolean {
//   let reversed = list.split("").reverse().join("");
//   return list === reversed;
// }
// console.log( palindromCheck("dad"))

//================================Task M==============================
//Masala:Shunday function yozing, u raqamlardan tashkil topgan array qabul qilsin va array ichidagi har bir raqam uchun raqamni ozi va hamda osha raqamni kvadratidan tashkil topgan object hosil qilib, hosil bolgan objectlarni array ichida qaytarsin.
//Yechim:
// function getSquareNumbers(arr: number[]) {
//   const result = [];

//   for (let i = 0; i < arr.length; i++) {
//     result.push({
//       number: arr[i],
//       square: arr[i] * arr[i]
//     });
//   }
//   return result;
// }

// console.log(getSquareNumbers([1, 2, 3]))
// return [{number: 1, square: 1}, {number: 2, square: 4}, {number: 3, square: 9}];

//================================Task L==============================
//Masala:Shunday function yozing, u string qabul qilsin va string ichidagi hamma sozlarni chappasiga yozib va sozlar ketma-ketligini buzmasdan stringni qaytarsin.
//Yechim:
// const reverseSentence = (matn: string): string => 
//   matn.split(" ").map(soz => soz.split("").reverse().join("")).join(" ");

// console.log(reverseSentence("we like coding!"))


//================================Task K==============================
//Masala: Shunday function yozing, u string qabul qilsin va string ichidagi unli harflar sonini qaytarsin.
//Yechim:
// const list: string[] = ["a", "e", "o", "i", "u", "o'" ]
// function countVowels(word: string):number {
//   let word1: string[]=word.split("")
//   let count: string[] = word1.filter((ele) => list.includes(ele))
//   return count.length
// }
// console.log(countVowels("string"))




//================================Task J==============================
//Masala: Shunday function tuzing, u string qabul qilsin va string ichidagi eng uzun so'zni qaytarsin.
//Yechim:

// function findLongestWord(word: string):string{
//   let word1:string[] = word.split(" ")
//   let n :string = word1[0]
//   for(let i=1; i<word1.length; i++){
//     if(n.length<word1[i].length)  n=word1[i]
//   }
//   return n
// }

// console.log(findLongestWord("I came from Uzbekistan!"));


//================================Task I==============================
// Masala: Shunday function tuzing, u parametrdagi array ichida eng ko'p takrorlangan raqamni topib qaytarsin.
//Yechim:
// function majorityElement(list: number[]): number{
//   let list1: number[] []= []
//   let maxArr: number[] = []

//   for (let i:number = 0; i < list.length; i++){
//     list1[i] = list.filter((ele: number )=> ele == list[i])

//     if (list1[i].length > maxArr.length) {
//       maxArr = list1[i]
//     }
//   }

//   return maxArr[0]

// }
// console.log(majorityElement([1, 3, 2, 4, 5, 4, 4 ,4,3,3, 4,3,4]))

//================================Task H2==============================
//Masala: Shunday function tuzing, unga string argument pass bolsin. Function ushbu agrumentdagi digitlarni yangi stringda return qilsin
// function getDigits(list: string): 
// string {
//     //return list.filter(ele => typeof ele === "number")
//     let list1: string[]= []
//     for (let i=0;i<list.length; i++){
//         if(!isNaN(Number(list[i])) ){
//             list1.push(list[i])
//         }
//     } 
//     return list1.join("")
// }
// let result: string = "m14i1t"
// console.log(getDigits(result))

//================================Task H==============================
//Masala: shunday function tuzing, u integerlardan iborat arrayni argument sifatida qabul qilib, faqat positive qiymatlarni olib string holatda return qilsin
// function getPositive(pos: number[]): 
// number[] {
//      let list: number[] = []
//     //return list=pos.filter(ele => ele>0)
//     list=pos.filter((ele) => {
//         if(ele >= 0){
//             return ele
//         }
//     })
//     return list
// }
// let list1: number[] = [3,0,7,-2,9,-7]
// console.log(getPositive(list1))




/* Project Standarts:
    - Logging standarts: morgan orqali terminalda log qilish, har bir restaurantController methodini terminalda log qildik.
    - Naming standarts:
        CAMEL => function, method, variable (memberService)
        PASCAL => class                     (MemberService)
        KEBAB => folder, file               (member-service.ts)
        SNAKE => css                        (member_service)
    - Error handling- bu loyihamizdagi sodir bolayotgan turli xil errorlarni handling handling qilish mexanizmi


Frontendning 2 xil deveopment jaraoni bor:
- Traditional FD => BSSR (Ejs,nestjs...) -Burak adminka
- Modern FD => SPA => (REACT....) -Burak for users




Cookies:
    request join,
    self destroy

Validation turlari:
Frontend, Pipe(Frontenddan serverga kirish oraligidagi), Backend, Database

*/