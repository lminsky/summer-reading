let csvUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vRYHRmMDeaqL3yhjk9HWpSxwrHq_oRV7XCmZ3gyJfHeZtk9L-xrxL3wcNPbGcaKUm-BaoUERDDxMvwI/pub?gid=0&single=true&output=tsv";
let books = [];
let tags = [];
let years = [];
let audiences = [];

//Get list from the spreadsheet
$.get(csvUrl, function (data, status) {
  // console.log(data);
  let temp = data.split("\n");
  let titles;
  for (let i in temp) {
    if (i == 0) {
      titles = temp[i].split("  ");
      for(let t in titles) {
        titles[t] = titles[t].trim();
      }
      continue;
    }
    temp[i] = temp[i].split(" ");
    let book = {};
    for (let j in temp[i]) {
      book[titles[j].toLowerCase()] = temp[i][j];
    }
    // console.log(book)

    //Split Years
    book.year = book.year.split(",");
    for (let j in book.year) {
      book.year[j] = parseInt(book.year[j].trim());
      if (!years.includes(book.year[j])) {
        years.push(book.year[j]);
        years.sort((a, b) => {
          return b - a;
        });
      }
    }
    
    //Split audience
    book.audience = book.audience.split(",");
    for (let j in book.audience) {
      book.audience[j] = book.audience[j].trim();
    }

    //Split Tags
    book.tags = book.tags.split(",");
    for (let j in book.tags) {
      book.tags[j] = book.tags[j].trim();
      // if (!tags.includes(book.tags[j])) {
      //   tags.push(book.tags[j]);
      //   tags.sort();
      // }
    }

    //Split Recommendations
    // book.recommended = book.recommended.split(",");
    // for (let j in book.recommended) {
    //   book.recommended[j] = book.recommended[j].trim();
    // }
    books.push(book);

  }
  
  // console.log(books);
  
  //Add the years to the select
  let select = $("#years");
  for(let y of years) {
    let option = $("<option>");
    option.value = y;
    option.text(y);
    select.append(option)
  }
  select.on('change', displayAudiences);
  select.val(years[0]);
  displayAudiences();
  
  $("#audience").on('change', displayTags);

});

function displayAudiences() {
  audiences = [];
  let y = parseInt($("#years").val());
  for(let b of books) {
    if(!b.year.includes(y)) continue;
    for(let a of b.audience) {
      if (!audiences.includes(a)) {
        audiences.push(a);
        audiences.sort();
      }
    }
  }
  let select = $("#audience");
  select.empty();
  for(let a of audiences) {
    let option = $("<option>");
    option.value = a;
    option.text(a);
    select.append(option)
  }
  select.val(audiences[0]);
  displayTags();
}

function displayTags() {
  tags = [];
  let y = parseInt($("#years").val());
  let a = $("#audience").val();
  for(let b of books) {
    if(!b.year.includes(y)) continue;
    if(!b.audience.includes(a)) continue;
    for(let t of b.tags) {
      if (!tags.includes(t)) {
        tags.push(t);
        tags.sort();
      }
    }
  }
  
  //Add the tags
  let t = $("#tags");
  t.empty()
  for(let ta of tags) {
    let div = $("<div class='tag'>")
    let input = $("<input type='checkbox'>");
    input.attr("value", ta);
    input.attr("name", ta);
    let label = $("<label>");
    label.attr("for", ta);
    label.text(ta);
    label.click(toggleTag);
    div.append(input, label);
    div.click(displayBooks);
    t.append(div)
  }
  displayBooks();
}

function displayBooks() {
  let booksDiv = $("#books");
  booksDiv.empty();
  let y = parseInt($("#years").val());
  let a = $("#audience").val();
  let t = $('input[type=checkbox]:checked')
  for(let i in books) {
    let b = books[i];
    //Confirm year and tags
    if(!b.year.includes(y)) continue;
    if(!b.audience.includes(a)) continue;
    let allTags = true;
    t.each((i,e) => {
      if(!b.tags.includes($(e).val())) allTags = false;
    });
    if(!allTags) continue;
    
    let link = $("<a>");
    link.click(() => {
      $("#modalImage").attr("src", b.image);
      $("#modalName").text(b.title);
      $("#modalAuthor").text("By " + b.author);
      $("#modalDescription").text(b.description);
      $("#modalTags").text("Tags: ");
      for(let i in b.tags) {
        $("#modalTags").text($("#modalTags").text() + b.tags[i]);
        if(i < b.tags.length - 1) $("#modalTags").text($("#modalTags").text() + ", ");
      }
    });
    link.attr('href',"#modal");
    link.attr('rel',"modal:open");
    let book = $("<book>");
    book.attr("index", i);
    let img = $("<img>");
    img.attr("src",b.image);
    let desc = $("<desc>");
    let name = $("<name>");
    name.text(b.title);
    let author = $("<author>");
    author.text("By " + b.author);

    desc.append(name, author);
    book.append(img, desc);
    link.append(book)
    booksDiv.append(link);
  }
}

function toggleTag(e) {
  let checkBox = $(e.target.previousSibling)
  checkBox.prop("checked", !checkBox.prop("checked"));
}