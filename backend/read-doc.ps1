$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Open("C:\Users\klila\Desktop\Haica\projet-stage.docx")
$text = $doc.Content.Text
$doc.Close()
$word.Quit()
$text
