function Part1form(){
    return(
        <form> 
            <h1>Add a new record</h1>
            <label for='id'>Item ID:</label>
            <input type='number' id='id' name='id'></input>
            <label for='qty'>Item QTY:</label>
            <input type='number' id='qty' name='qty'></input>
            <label for='price'>Item Price:</label>
            <input type='number' id='price' name='price'></input>
            <label for='location'>Location:</label>
            <input type='text' id='location' name='location'></input>
            <input type="submit" value="Add new Record"></input>
        </form>
    )
}
export default Part1form;