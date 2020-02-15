"""Module contains utils for work with records and databases."""


def pack_query_to_dict(result):
    print(result)
    """
    Depracateds
    Pack query result to dictionary.

    Takes list of Immutable dict returned by sqlalchemy, fetch headers from
    it first row, and append all given result to dicitonary
    """
    if len(result) == 0:
        return
    else:
        keys = result[0].keys()
    return {
        'headers': keys,
        'result': result
    }