function extractLastNumber(str) {
    // Regular expression to match all numbers (including decimal points and commas)
    const regex = /!?[\d,]+\.?\d*/g;

    // Extract numbers and return them in an array
    let numbers = str.match(regex);

    // If numbers are found, clean and return the last one
    if (numbers) {
        return numbers[numbers.length - 1].replace(/,/g, '');
    }

    return null;
}

function calculateTotal(col,amount,amountClass, soldId) {
          var sum=0;
          jQuery('input.'+amountClass).each(function() {

            var value = parseFloat($(this).val().replace(/,/g, ''));

            if (!isNaN(value)) {
                sum += value;
                  console.warn(value);
            }
        });
        var sold=amount-sum;
        console.warn('#'+soldId+' = '+sold);
        jQuery('#'+soldId).val(sold.toFixed(2));
}